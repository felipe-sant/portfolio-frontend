import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { act, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import routes from "@/routers/routes"
import buildProfile from "@/testUtils/buildProfile"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type ProjectDocument from "@/types/project/ProjectDocument.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const NAMES = { "pt-BR": "Projeto", en: "Project", es: "Proyecto" }
const ID_ONE = "0192f1a0-0000-7000-8000-000000000001"
const ID_TWO = "0192f1a0-0000-7000-8000-000000000002"
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

function image(index: number) {
    return {
        large: { src: `/images/p/${index}-large.webp`, width: 1600, height: 900 },
        small: { src: `/images/p/${index}-small.webp`, width: 640, height: 360 },
        alt: `Captura ${index}`,
        caption: `Legenda ${index}`
    }
}

function buildRecords(language: (typeof LANGUAGES)[number], count = 2): ProjectRecord[] {
    return Array.from({ length: count }, (_value, index) => {
        const number = index + 1
        const id = `0192f1a0-0000-7000-8000-${String(number).padStart(12, "0")}`

        return buildProjectRecord({
            id,
            title: `${NAMES[language]} ${number}`,
            summary: `Resumo ${language} ${number}`,
            date: `2026-${String((number % 12) + 1).padStart(2, "0")}`,
            types: number % 2 === 1 ? ["web", "api"] : ["api"],
            featured: number === 1,
            images: number === 1 ? [image(1), image(2)] : [],
            documents: number === 1 ? [README, SETUP, LICENSE] : [README],
            related: number === 1 ? [{ id: ID_TWO, reason: `Motivo ${language}` }] : []
        })
    })
}

function buildFiles(count = 2) {
    const files: Record<string, unknown> = {}

    for (const language of LANGUAGES) {
        files[`content/${language}/projects.json`] = { items: buildRecords(language, count) }
        files[`content/${language}/profile.json`] = buildProfile()
        files[`content/${language}/projects/${ID_ONE}/docs/README.md`] =
            `# Título\n\n## Instalação\n\nTexto do readme ${language}`
        files[`content/${language}/projects/${ID_ONE}/docs/SETUP.md`] =
            `## Passos\n\nTexto do setup ${language}`
        files[`content/${language}/projects/${ID_TWO}/docs/README.md`] =
            `## Outro\n\nReadme do segundo ${language}`
    }
    files[`content/shared/projects/${ID_ONE}/docs/LICENSE`] = "MIT License\n\nCopyright"

    return files
}

function renderProject(entry: string, count = 2) {
    const fetchMock = stubContentFetch(buildFiles(count))
    const router = createMemoryRouter(routes, { initialEntries: [entry] })
    const utils = renderWithStore(<RouterProvider router={router} />)

    return { router, fetchMock, ...utils }
}

async function projectLoaded(name = "Projeto 1") {
    return screen.findByRole("heading", { level: 1, name }, { timeout: 5000 })
}

beforeEach(() => {
    window.history.pushState({}, "", "/")
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("ProjectPage, não encontrada", () => {
    it.each([
        ["id fora do formato", "/pt-BR/projects/nao-e-um-uuid"],
        ["id inexistente", "/pt-BR/projects/0192f1a0-0000-7000-8000-000000000099"],
        ["documento fora da lista", `/pt-BR/projects/${ID_ONE}/docs/OUTRO.md`],
        ["README em /docs/", `/pt-BR/projects/${ID_ONE}/docs/README.md`],
        ["subcaminho desconhecido", `/pt-BR/projects/${ID_ONE}/outra`]
    ])("mostra a não encontrada com rodapé, noindex e sem SEO para %s", async (_name, path) => {
        renderProject(path)

        expect(
            await screen.findByRole(
                "heading",
                { level: 1, name: "Página não encontrada" },
                { timeout: 5000 }
            )
        ).toBeInTheDocument()
        if (!path.endsWith("/outra")) {
            expect(screen.getByRole("contentinfo")).toBeInTheDocument()
        }
        expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
            "content",
            "noindex"
        )
        expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
        expect(document.head.querySelector('script[type="application/ld+json"]')).toBeNull()
    })

    it("mostra a não encontrada em inglês sem o prefixo do idioma", async () => {
        renderProject(`/projects/${ID_ONE}`)

        expect(
            await screen.findByRole(
                "heading",
                { level: 1, name: "Page not found" },
                { timeout: 5000 }
            )
        ).toBeInTheDocument()
    })

    it("mostra a não encontrada no idioma do prefixo", async () => {
        renderProject(`/en/projects/${ID_ONE}/docs/OUTRO.md`)

        expect(
            await screen.findByRole(
                "heading",
                { level: 1, name: "Page not found" },
                { timeout: 5000 }
            )
        ).toBeInTheDocument()
    })
})

describe("ProjectPage, rota e conteúdo", () => {
    it.each(LANGUAGES)(
        "abre o projeto e o documento em %s, com o h1 no idioma do caminho",
        async (language) => {
            const { router } = renderProject(`/${language}/projects/${ID_ONE}`)

            expect(await projectLoaded(`${NAMES[language]} 1`)).toBeInTheDocument()
            expect(document.documentElement.lang).toBe(language)

            await act(async () => {
                await router.navigate(`/${language}/projects/${ID_ONE}/docs/SETUP.md`)
            })

            expect(
                await screen.findByRole("heading", { level: 2, name: "SETUP.md" })
            ).toBeInTheDocument()
            expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
                `${NAMES[language]} 1`
            )
        }
    )

    it("o pai da rota enxerga o name da filha e troca a caixa do nome por replace", async () => {
        const { router } = renderProject(`/pt-BR/projects/${ID_ONE}/docs/setup.md`)

        await waitFor(() =>
            expect(router.state.location.pathname).toBe(`/pt-BR/projects/${ID_ONE}/docs/SETUP.md`)
        )
        expect(router.state.historyAction).toBe("REPLACE")
        expect(
            await screen.findByRole("heading", { level: 2, name: "SETUP.md" })
        ).toBeInTheDocument()
    })

    it("mostra o cabeçalho com badges, rótulo, h1 e resumo", async () => {
        const { container } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()

        expect(screen.getByText("Em destaque")).toBeInTheDocument()
        expect(screen.getByText("Pessoal", { selector: "span" })).toBeInTheDocument()
        const label = container.querySelector("main header p")
        expect(label?.textContent?.replace(/\s+/g, " ")).toBe("Web · API · 2026")
        expect(label?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
        expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute("tabindex", "-1")
        expect(screen.getByText("Resumo pt-BR 1")).toBeInTheDocument()
    })

    it("não mostra o badge de destaque em projeto que não é destaque", async () => {
        renderProject(`/pt-BR/projects/${ID_TWO}`)
        await projectLoaded("Projeto 2")

        expect(screen.queryByText("Em destaque")).not.toBeInTheDocument()
    })

    it("tem um main, um h1 e o título do README ou do documento", async () => {
        const { router } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()

        expect(screen.getAllByRole("main")).toHaveLength(1)
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
        await waitFor(() => expect(document.title).toBe("Projeto 1 · Luiz Felipe dos Santos"))

        await act(async () => {
            await router.navigate(`/pt-BR/projects/${ID_ONE}/docs/SETUP.md`)
        })

        await waitFor(() =>
            expect(document.title).toBe("SETUP.md · Projeto 1 · Luiz Felipe dos Santos")
        )
    })

    it("põe galeria, ficha e documentação nessa ordem no HTML", async () => {
        renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()
        const gallery = screen.getByRole("region", { name: "Galeria" })
        const facts = screen.getByRole("heading", { level: 2, name: "Ficha técnica" })
        const documentTitle = screen.getByRole("heading", { level: 2, name: "README.md" })

        expect(within(gallery).getByRole("img", { name: "Captura 1" })).toBeInTheDocument()
        expect(
            gallery.compareDocumentPosition(facts) & Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy()
        expect(
            facts.compareDocumentPosition(documentTitle) & Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy()
    })

    it("sem capturas, mostra o placeholder no lugar da galeria", async () => {
        renderProject(`/pt-BR/projects/${ID_TWO}`)
        await projectLoaded("Projeto 2")

        expect(screen.queryByRole("region", { name: "Galeria" })).not.toBeInTheDocument()
    })

    it("tem a barra de volta como link real, sem Próximo nem contador", async () => {
        const { container } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()
        const back = screen.getByRole("link", { name: "Voltar para Projetos" })

        expect(back).toHaveAttribute("href", "/pt-BR/projects")
        expect(back.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
        expect(screen.queryByText(/Próximo/)).not.toBeInTheDocument()
        expect(container.textContent).not.toMatch(/Projeto \d+ de \d+/)
    })

    it("com relacionados mostra a seção e leva ao outro projeto com foco no h1; sem, a seção não existe", async () => {
        const user = userEvent.setup()
        const { router } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()
        const related = screen.getByRole("heading", { level: 2, name: "Projetos relacionados" })

        expect(related).toBeInTheDocument()
        expect(screen.getByText("Motivo pt-BR")).toBeInTheDocument()

        await user.click(screen.getByRole("link", { name: "Projeto 2" }))

        expect(router.state.location.pathname).toBe(`/pt-BR/projects/${ID_TWO}`)
        const heading = await projectLoaded("Projeto 2")
        await waitFor(() => expect(heading).toHaveFocus())
        expect(
            screen.queryByRole("heading", { name: "Projetos relacionados" })
        ).not.toBeInTheDocument()
    })

    it("troca de documento pela nav sem refazer o projeto, sem skeleton e com foco no título", async () => {
        const user = userEvent.setup()
        const { store } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()
        await user.click(screen.getByRole("button", { name: /Imagem 2 de 2/ }))

        await user.click(screen.getByRole("link", { name: "SETUP.md: Projeto 1" }))

        const title = await screen.findByRole("heading", { level: 2, name: "SETUP.md" })
        await waitFor(() => expect(title).toHaveFocus())
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Projeto 1")
        expect(screen.getByText("2 de 2")).toBeInTheDocument()
        const projectQueries = Object.values(store.getState().api.queries).filter(
            (query) => query?.endpointName === "getProject"
        )
        expect(projectQueries).toHaveLength(1)
        expect(await screen.findByText("Passos", {}, { timeout: 5000 })).toBeInTheDocument()
    })

    it("troca de idioma num documento mantendo id, documento e âncora", async () => {
        const user = userEvent.setup()
        const { router } = renderProject(`/pt-BR/projects/${ID_ONE}/docs/SETUP.md#passos`)
        await projectLoaded()

        await user.click(screen.getAllByRole("button", { name: "Idioma: Português" })[0])
        const link = screen.getByRole("link", { name: "English" })
        expect(link).toHaveAttribute("href", `/en/projects/${ID_ONE}/docs/SETUP.md#passos`)
        await user.click(link)

        await waitFor(() =>
            expect(router.state.location.pathname).toBe(`/en/projects/${ID_ONE}/docs/SETUP.md`)
        )
        expect(router.state.location.hash).toBe("#passos")
        expect(await projectLoaded("Project 1")).toBeInTheDocument()
    })

    it("dá nome que diz o destino a todo link da tela", async () => {
        renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()

        for (const link of within(screen.getByRole("main")).getAllByRole("link")) {
            expect(link).toHaveAccessibleName(/\S{3,}/)
            expect(link.textContent).not.toMatch(/^(clique aqui|saiba mais|aqui)$/i)
        }
    })

    it("volta da tela à lista com a busca, o filtro e a quantidade, depois de abrir dois documentos", async () => {
        const user = userEvent.setup()
        const { router } = renderProject("/pt-BR/projects?type=web", 20)
        await user.click(
            await screen.findByRole("button", { name: "Carregar mais" }, { timeout: 5000 })
        )
        const card = await screen.findByRole("link", { name: "Projeto 1" }, { timeout: 5000 })

        await user.click(card)
        await projectLoaded()
        await user.click(screen.getByRole("link", { name: "SETUP.md: Projeto 1" }))
        await screen.findByRole("heading", { level: 2, name: "SETUP.md" })
        await user.click(screen.getByRole("link", { name: "LICENSE: Projeto 1" }))
        await screen.findByRole("heading", { level: 2, name: "LICENSE" })
        await user.click(screen.getByRole("link", { name: "Voltar para Projetos" }))

        await waitFor(() => expect(router.state.location.pathname).toBe("/pt-BR/projects"))
        expect(router.state.location.search).toBe("?type=web")
        await waitFor(() =>
            expect(screen.getAllByRole("heading", { level: 2 }).length).toBeGreaterThanOrEqual(10)
        )
    }, 30000)

    it("sem a marca, a barra de volta abre /projects sem query", async () => {
        const user = userEvent.setup()
        const { router } = renderProject(`/pt-BR/projects/${ID_ONE}?x=1`)
        await projectLoaded()

        await user.click(screen.getByRole("link", { name: "Voltar para Projetos" }))

        await waitFor(() => expect(router.state.location.pathname).toBe("/pt-BR/projects"))
        expect(router.state.location.search).toBe("")
    })

    it("não tem violações de acessibilidade com o README nem com um documento de texto", async () => {
        const { container, router } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()
        await screen.findByRole("heading", { level: 3, name: "Instalação" }, { timeout: 10000 })
        await expectNoAxeViolations(container)

        await act(async () => {
            await router.navigate(`/pt-BR/projects/${ID_ONE}/docs/LICENSE`)
        })
        await screen.findByRole("region", { name: "LICENSE" }, { timeout: 5000 })

        await expectNoAxeViolations(container)
    }, 40000)
})
