import { describe, expect, it } from "vitest"
import { act, render, screen, within } from "@testing-library/react"
import StackGroupList from "@/components/StackGroupList"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type StackGroup from "@/types/content/StackGroup.types"

const GROUPS: StackGroup[] = [
    { category: "frontend", items: [{ name: "TypeScript" }, { name: "React" }] },
    { category: "backend", items: [{ name: "Node.js" }] },
    { category: "tooling", items: [{ name: "Docker" }, { name: "Git" }, { name: "Vite" }] }
]

describe("StackGroupList", () => {
    it("mostra um h3 por grupo na ordem recebida e uma lista de chips na ordem do conteúdo", () => {
        render(<StackGroupList groups={GROUPS} />)
        const headings = screen.getAllByRole("heading", { level: 3 })

        expect(headings.map((heading) => heading.textContent)).toEqual([
            "Frontend",
            "Backend",
            "Infra e ferramentas"
        ])
        const lists = screen.getAllByRole("list")

        expect(lists).toHaveLength(3)
        expect(
            within(lists[0])
                .getAllByRole("listitem")
                .map((item) => item.textContent)
        ).toEqual(["TypeScript", "React"])
    })

    it("mostra a contagem de cada grupo com o plural oculto", () => {
        render(<StackGroupList groups={GROUPS} />)

        expect(screen.getByText("2 tecnologias")).toBeInTheDocument()
        expect(screen.getByText("1 tecnologia")).toBeInTheDocument()
        expect(screen.getByText("3 tecnologias")).toBeInTheDocument()
    })

    it.each([
        ["en", ["Frontend", "Backend", "Infra and tooling"]],
        ["es", ["Frontend", "Backend", "Infra y herramientas"]]
    ] as const)("traduz o rótulo da categoria em %s", async (language, labels) => {
        await act(() => setLanguage(language))
        render(<StackGroupList groups={GROUPS} />)

        expect(
            screen.getAllByRole("heading", { level: 3 }).map((item) => item.textContent)
        ).toEqual(labels)
    })

    it("não traduz nem marca com lang o nome da tecnologia", () => {
        render(<StackGroupList groups={GROUPS} />)

        expect(screen.getByText("Node.js")).not.toHaveAttribute("lang")
    })

    it("com lista vazia não renderiza nada", () => {
        const { container } = render(<StackGroupList groups={[]} />)

        expect(container).toBeEmptyDOMElement()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<StackGroupList groups={GROUPS} />)

        await expectNoAxeViolations(container)
    }, 15000)
})
