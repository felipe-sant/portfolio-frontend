import { describe, expect, it } from "vitest"
import { act, render, screen, within } from "@testing-library/react"
import ProjectFacts from "@/components/ProjectFacts"
import setLanguage from "@/i18n/setLanguage"
import buildProjectDetailFixture from "@/testUtils/buildProjectDetailFixture"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type ProjectDetail from "@/types/project/ProjectDetail.types"

function renderFacts(overrides: Partial<ProjectDetail> = {}) {
    return render(<ProjectFacts project={buildProjectDetailFixture(overrides)} />)
}

describe("ProjectFacts", () => {
    it("mostra o h2 e um dl com os sete pares na ordem da ficha", () => {
        const { container } = renderFacts()
        const terms = Array.from(container.querySelectorAll("dt")).map((term) => term.textContent)

        expect(screen.getByRole("heading", { level: 2, name: "Ficha técnica" })).toBeInTheDocument()
        expect(container.querySelectorAll("dl")).toHaveLength(1)
        expect(terms).toEqual(["Ano", "Tipo", "Categoria", "Papel", "Duração", "Time", "Situação"])
        expect(container.querySelectorAll("dd")).toHaveLength(7)
    })

    it("mostra o ano em time com datetime AAAA-MM e texto só do ano", () => {
        const { container } = renderFacts({ date: "2026-03" })
        const time = container.querySelector("time")

        expect(time).toHaveAttribute("datetime", "2026-03")
        expect(time?.textContent).toBe("2026")
    })

    it("mostra um único dd de tipo para um tipo só", () => {
        const { container } = renderFacts({ types: ["web"] })
        const type = container.querySelectorAll("dd")[1]

        expect(type).toHaveTextContent("Web")
        expect(type.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0)
    })

    it("junta vários tipos num único dd na ordem do conteúdo, com separadores aria-hidden", () => {
        const { container } = renderFacts({ types: ["web", "api", "data"] })
        const type = container.querySelectorAll("dd")[1]

        expect(type.textContent?.replace(/\s+/g, " ")).toBe("Web · API · Dados / IA")
        expect(type.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
    })

    it("mostra categoria, papel, duração e time do projeto", () => {
        renderFacts({ category: "academic", role: "Back-end", duration: "3 meses", team: "Dupla" })

        expect(screen.getByText("Acadêmico")).toBeInTheDocument()
        expect(screen.getByText("Back-end")).toBeInTheDocument()
        expect(screen.getByText("3 meses")).toBeInTheDocument()
        expect(screen.getByText("Dupla")).toBeInTheDocument()
    })

    it.each([
        ["inDevelopment", "Em desenvolvimento"],
        ["completed", "Concluído"],
        ["discontinued", "Descontinuado"]
    ] as const)("mostra a situação %s com o indicador aria-hidden", (status, text) => {
        const { container } = renderFacts({ status })
        const situation = container.querySelectorAll("dd")[6]

        expect(within(situation).getByText(text)).toBeInTheDocument()
        expect(situation.querySelector('span[aria-hidden="true"]')).toBeInTheDocument()
    })

    it.each([
        ["pt-BR", "Ficha técnica", "Ano", "Concluído"],
        ["en", "Fact sheet", "Year", "Completed"],
        ["es", "Ficha técnica", "Año", "Concluido"]
    ])("traduz termos e valores em %s", async (language, heading, year, status) => {
        renderFacts()
        await act(() => setLanguage(language as "pt-BR" | "en" | "es"))

        expect(screen.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument()
        expect(screen.getByText(year)).toBeInTheDocument()
        expect(screen.getByText(status)).toBeInTheDocument()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderFacts()

        await expectNoAxeViolations(container)
    }, 15000)
})
