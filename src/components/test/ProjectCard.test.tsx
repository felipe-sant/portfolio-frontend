import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { act, render, screen, within } from "@testing-library/react"
import ProjectCard from "@/components/ProjectCard"
import setLanguage from "@/i18n/setLanguage"
import buildProjectSummary from "@/testUtils/buildProjectSummary"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type ProjectSummary from "@/types/project/ProjectSummary.types"

function renderCard(overrides: Partial<ProjectSummary> = {}, index = 0) {
    const project = buildProjectSummary(overrides)

    return {
        project,
        ...render(
            <MemoryRouter>
                <ul>
                    <li>
                        <ProjectCard project={project} index={index} revealIndex={index} />
                    </li>
                </ul>
            </MemoryRouter>
        )
    }
}

describe("ProjectCard", () => {
    it("mostra o placeholder aria-hidden e nenhuma imagem sem capa", () => {
        const { container } = renderCard({ cover: undefined })

        expect(container.querySelector("img")).not.toBeInTheDocument()
        expect(container.querySelector('div[aria-hidden="true"]')).toBeInTheDocument()
    })

    it("renderiza a capa com alt vazio, srcset, largura, altura e sizes", () => {
        const { container } = renderCard()
        const image = container.querySelector("img")

        expect(image).toHaveAttribute("alt", "")
        expect(image?.getAttribute("srcset")).toContain("640w")
        expect(image?.getAttribute("srcset")).toContain("1280w")
        expect(image).toHaveAttribute("width", "1280")
        expect(image).toHaveAttribute("height", "720")
        expect(image?.getAttribute("sizes")).toBeTruthy()
    })

    it("dá prioridade alta à primeira imagem e carga tardia da quarta em diante", () => {
        const first = renderCard({}, 0)
        expect(first.container.querySelector("img")).toHaveAttribute("fetchpriority", "high")
        expect(first.container.querySelector("img")).not.toHaveAttribute("loading", "lazy")
        first.unmount()

        const second = renderCard({}, 1)
        expect(second.container.querySelector("img")).not.toHaveAttribute("loading", "lazy")
        expect(second.container.querySelector("img")).not.toHaveAttribute("fetchpriority")
        second.unmount()

        const third = renderCard({}, 2)
        expect(third.container.querySelector("img")).not.toHaveAttribute("loading", "lazy")
        third.unmount()

        const fourth = renderCard({}, 3)
        expect(fourth.container.querySelector("img")).toHaveAttribute("loading", "lazy")
        expect(fourth.container.querySelector("img")).toHaveAttribute("decoding", "async")
    })

    it("tem o título em h2 com um único link com o nome do projeto", () => {
        const { project } = renderCard()
        const heading = screen.getByRole("heading", { level: 2 })
        const link = within(heading).getByRole("link", { name: project.title })

        expect(link).toHaveAttribute("href", `/pt-BR/projects/${project.id}`)
        expect(screen.getAllByRole("link")).toHaveLength(1)
    })

    it("mantém o prefixo do idioma em en", async () => {
        const { project } = renderCard()

        await act(() => setLanguage("en"))

        expect(screen.getByRole("link", { name: project.title })).toHaveAttribute(
            "href",
            `/en/projects/${project.id}`
        )
    })

    it("não tem nada interativo além do link do título", () => {
        renderCard()

        expect(screen.getAllByRole("link")).toHaveLength(1)
        expect(screen.queryAllByRole("button")).toHaveLength(0)
    })

    it.each([
        ["pt-BR", "Em destaque"],
        ["en", "Featured"],
        ["es", "Destacado"]
    ] as const)(
        "mostra a estrela aria-hidden e %s dentro do h2 e fora do link em destaque",
        async (language, label) => {
            const { container } = renderCard({ featured: true })
            await act(() => setLanguage(language))

            const heading = screen.getByRole("heading", { level: 2 })
            const hidden = within(heading).getByText(label)

            expect(heading.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
            expect(heading.querySelector("a")).not.toContainElement(hidden)
            expect(container.querySelectorAll("svg")).toHaveLength(1)
        }
    )

    it("não mostra estrela nem texto de destaque quando não é destaque", () => {
        const { container } = renderCard({ featured: false })

        expect(container.querySelector("svg")).not.toBeInTheDocument()
        expect(screen.queryByText("Em destaque")).not.toBeInTheDocument()
    })

    it("mostra o ano em time com datetime AAAA-MM", () => {
        const { container } = renderCard({ date: "2026-03" })
        const time = container.querySelector("time")

        expect(time).toHaveAttribute("datetime", "2026-03")
        expect(time).toHaveTextContent("2026")
        expect(time?.textContent).toBe("2026")
    })

    it.each([
        ["pt-BR", "Web", "API", "Pessoal"],
        ["en", "Web", "API", "Personal"],
        ["es", "Web", "API", "Personal"]
    ] as const)(
        "mostra tipos e categoria com separador aria-hidden em %s",
        async (language, web, api, category) => {
            const { container } = renderCard({ types: ["web", "api"], category: "personal" })
            await act(() => setLanguage(language))

            const meta = container.querySelector("p")

            expect(meta?.textContent?.replace(/\s+/g, " ")).toBe(`${web} · ${api} · ${category}`)
            expect(meta?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
        }
    )

    it("mostra o resumo inteiro e no máximo três chips", () => {
        const summary = "Resumo ".repeat(40).trim()
        renderCard({
            summary,
            cardTechnologies: ["A", "B", "C", "D", "E"]
        })

        expect(screen.getByText(summary)).toBeInTheDocument()
        expect(screen.getAllByRole("listitem")).toHaveLength(1 + 3)
        expect(screen.queryByText("D")).not.toBeInTheDocument()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderCard({ featured: true })

        await expectNoAxeViolations(container)
    }, 15000)
})
