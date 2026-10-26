import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMemoryRouter, MemoryRouter, RouterProvider, useLocation } from "react-router-dom"
import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProjectDocumentSection from "@/components/ProjectDocumentSection"
import setLanguage from "@/i18n/setLanguage"
import type useProjectDocument from "@/pages/hooks/useProjectDocument"
import buildProjectDetailFixture from "@/testUtils/buildProjectDetailFixture"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type ProjectDocument from "@/types/project/ProjectDocument.types"
import loadMarkdownRenderer from "@/utils/loadMarkdownRenderer"

vi.mock("@/utils/loadMarkdownRenderer", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/utils/loadMarkdownRenderer")>()

    return { default: vi.fn(original.default) }
})

type DocumentState = ReturnType<typeof useProjectDocument>

const README: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b0",
    name: "README.md",
    format: "markdown",
    translated: true
}
const SETUP: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b1",
    name: "SETUP.md",
    format: "markdown",
    translated: true
}
const LICENSE: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b2",
    name: "LICENSE",
    format: "text",
    translated: false,
    contentLanguage: "en"
}
const PROJECT = buildProjectDetailFixture({ documents: [README, SETUP, LICENSE] })

function buildState(
    document: ProjectDocument,
    overrides: Partial<DocumentState> = {}
): DocumentState {
    return {
        status: "success",
        document,
        exactName: document.name,
        content: "# Título\n\n## Seção\n\ntexto",
        format: document.format === "markdown" ? "markdown" : "text",
        lang: undefined,
        retry: vi.fn(),
        ...overrides
    }
}

function renderSection(state: DocumentState) {
    return render(
        <MemoryRouter>
            <ProjectDocumentSection project={PROJECT} state={state} />
        </MemoryRouter>
    )
}

function SectionByPath() {
    const { pathname } = useLocation()

    return (
        <ProjectDocumentSection
            project={PROJECT}
            state={buildState(pathname === "/b" ? LICENSE : README, {
                content: "x",
                format: "text"
            })}
        />
    )
}

beforeEach(() => {
    vi.mocked(loadMarkdownRenderer).mockClear()
})

afterEach(() => {
    vi.restoreAllMocks()
})

describe("ProjectDocumentSection", () => {
    it("renderiza documento text em TextDocument sem carregar o renderizador de markdown", () => {
        renderSection(buildState(LICENSE, { content: "MIT License\n# não é título", lang: "en" }))
        const block = screen.getByRole("region", { name: "LICENSE" })

        expect(block.tagName).toBe("PRE")
        expect(block).toHaveTextContent("# não é título")
        expect(loadMarkdownRenderer).not.toHaveBeenCalled()
    })

    it("trata formato desconhecido como text", () => {
        renderSection(buildState(SETUP, { format: "text", content: "# literal" }))

        expect(screen.getByRole("region", { name: "SETUP.md" }).tagName).toBe("PRE")
        expect(loadMarkdownRenderer).not.toHaveBeenCalled()
    })

    it("carrega o renderizador e mostra o markdown renderizado", async () => {
        renderSection(buildState(README))

        expect(
            await screen.findByRole("heading", { level: 3, name: "Seção" }, { timeout: 10000 })
        ).toBeInTheDocument()
    }, 15000)

    it("mostra o h2 visível com o nome, tabIndex -1, depois da nav", () => {
        const { container } = renderSection(buildState(LICENSE, { content: "x" }))
        const title = screen.getByRole("heading", { level: 2, name: "LICENSE" })
        const nav = screen.getByRole("navigation", { name: "Documentação do projeto" })

        expect(title).toHaveAttribute("tabindex", "-1")
        expect(nav.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(container.querySelectorAll("h2")).toHaveLength(1)
    })

    it("mantém a nav como filha direta da seção, para o sticky valer na seção inteira", () => {
        renderSection(buildState(LICENSE, { content: "x" }))
        const nav = screen.getByRole("navigation", { name: "Documentação do projeto" })
        const title = screen.getByRole("heading", { level: 2, name: "LICENSE" })

        expect(nav.parentElement).toBe(title.parentElement)
        expect(nav.parentElement?.tagName).toBe("SECTION")
    })

    it("carregando, mostra o título, o skeleton aria-hidden e o status só na área, com a nav", () => {
        renderSection(buildState(README, { status: "loading", content: undefined }))

        expect(screen.getByRole("heading", { level: 2, name: "README.md" })).toBeInTheDocument()
        expect(screen.getByRole("status")).toHaveTextContent("Carregando...")
        expect(document.querySelector('span[aria-hidden="true"]')).toBeInTheDocument()
        expect(screen.getByRole("navigation")).toBeInTheDocument()
    })

    it("com erro, mostra o alerta depois do título e tenta de novo só o documento", async () => {
        const retry = vi.fn()
        const user = userEvent.setup()
        renderSection(buildState(README, { status: "error", content: undefined, retry }))
        const alert = screen.getByRole("alert")
        const title = screen.getByRole("heading", { level: 2 })

        expect(title.compareDocumentPosition(alert) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(within(alert).getByText("Não consegui carregar este documento")).toBeInTheDocument()
        expect(
            within(alert).getByText(
                "O restante da página continua aqui. Tente de novo em alguns segundos."
            )
        ).toBeInTheDocument()
        expect(screen.getByRole("navigation")).toBeInTheDocument()

        await user.click(within(alert).getByRole("button", { name: "Tentar novamente" }))

        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("move o foco para o h2 do novo documento sem rolar quando o título está visível", () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")
        const { rerender } = renderSection(buildState(README))

        expect(screen.getByRole("heading", { level: 2 })).not.toHaveFocus()

        rerender(
            <MemoryRouter>
                <ProjectDocumentSection
                    project={PROJECT}
                    state={buildState(LICENSE, { content: "x" })}
                />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { level: 2, name: "LICENSE" })).toHaveFocus()
        expect(scroll).not.toHaveBeenCalled()
    })

    it("rola até o título quando ele ficou acima da área visível", () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")
        const { rerender } = renderSection(buildState(README))
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
            this: HTMLElement
        ) {
            const isTitle = this instanceof HTMLHeadingElement
            return new DOMRect(0, isTitle ? -300 : 0, 100, isTitle ? 20 : 48)
        })

        rerender(
            <MemoryRouter>
                <ProjectDocumentSection
                    project={PROJECT}
                    state={buildState(LICENSE, { content: "x" })}
                />
            </MemoryRouter>
        )

        expect(scroll).toHaveBeenCalledTimes(1)
    })

    it("não rola até o título ao voltar no histórico, para preservar a rolagem restaurada", async () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")
        const router = createMemoryRouter([{ path: "*", element: <SectionByPath /> }], {
            initialEntries: ["/a", "/b", "/c"],
            initialIndex: 2
        })
        render(<RouterProvider router={router} />)
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
            this: HTMLElement
        ) {
            const isTitle = this instanceof HTMLHeadingElement
            return new DOMRect(0, isTitle ? -300 : 0, 100, isTitle ? 20 : 48)
        })

        await act(() => router.navigate(-1))

        expect(screen.getByRole("heading", { level: 2, name: "LICENSE" })).toHaveFocus()
        expect(scroll).not.toHaveBeenCalled()
    })

    it("rola até o título da âncora quando o markdown chega depois da navegação", async () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")
        const loading = buildState(README, { status: "loading", content: undefined })
        const { rerender } = render(
            <MemoryRouter initialEntries={["/projeto#seção"]}>
                <ProjectDocumentSection project={PROJECT} state={loading} />
            </MemoryRouter>
        )

        expect(scroll).not.toHaveBeenCalled()

        rerender(
            <MemoryRouter initialEntries={["/projeto#seção"]}>
                <ProjectDocumentSection project={PROJECT} state={buildState(README)} />
            </MemoryRouter>
        )
        const target = await screen.findByRole(
            "heading",
            { level: 3, name: "Seção" },
            { timeout: 10000 }
        )

        await vi.waitFor(() => expect(scroll.mock.contexts).toContain(target))
    }, 15000)

    it("rola até a âncora quando o documento já está renderizado", async () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")
        render(
            <MemoryRouter initialEntries={["/projeto#seção"]}>
                <ProjectDocumentSection project={PROJECT} state={buildState(README)} />
            </MemoryRouter>
        )
        const target = await screen.findByRole(
            "heading",
            { level: 3, name: "Seção" },
            { timeout: 10000 }
        )

        await vi.waitFor(() => expect(scroll.mock.contexts).toContain(target))
    }, 15000)

    it("não rola quando a âncora não existe no documento", async () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")
        render(
            <MemoryRouter initialEntries={["/projeto#inexistente"]}>
                <ProjectDocumentSection project={PROJECT} state={buildState(README)} />
            </MemoryRouter>
        )
        await screen.findByRole("heading", { level: 3, name: "Seção" }, { timeout: 10000 })

        expect(scroll).not.toHaveBeenCalled()
    }, 15000)

    it("não move o foco na primeira renderização", () => {
        renderSection(buildState(LICENSE, { content: "x" }))

        expect(document.body).toHaveFocus()
    })

    it("leva lang no bloco de documento neutro com contentLanguage", () => {
        renderSection(buildState(LICENSE, { content: "x", lang: "en" }))

        expect(screen.getByRole("region", { name: "LICENSE" })).toHaveAttribute("lang", "en")
    })

    it.each([
        ["en", "Project documentation", "I couldn't load this document"],
        ["es", "Documentación del proyecto", "No pude cargar este documento"]
    ] as const)("traduz os textos em %s", async (language, navName, errorTitle) => {
        renderSection(buildState(README, { status: "error", content: undefined }))
        await act(() => setLanguage(language))

        expect(screen.getByRole("navigation", { name: navName })).toBeInTheDocument()
        expect(screen.getByText(errorTitle)).toBeInTheDocument()
    })

    it("não tem violações de acessibilidade em markdown, texto, carregando e erro", async () => {
        const markdown = renderSection(buildState(README))
        await screen.findByRole("heading", { level: 3, name: "Seção" }, { timeout: 10000 })
        await expectNoAxeViolations(markdown.container)
        markdown.unmount()

        const text = renderSection(buildState(LICENSE, { content: "MIT", lang: "en" }))
        await expectNoAxeViolations(text.container)
        text.unmount()

        const loading = renderSection(buildState(README, { status: "loading", content: undefined }))
        await expectNoAxeViolations(loading.container)
        loading.unmount()

        const failed = renderSection(buildState(README, { status: "error", content: undefined }))
        await expectNoAxeViolations(failed.container)
    }, 40000)
})
