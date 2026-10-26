import { describe, expect, it } from "vitest"
import { act, render, screen, within } from "@testing-library/react"
import ProjectStack from "@/components/ProjectStack"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type StackGroup from "@/types/content/StackGroup.types"

const STACK: StackGroup[] = [
    { category: "tooling", items: [{ name: "Docker" }] },
    { category: "frontend", items: [{ name: "React" }, { name: "TypeScript" }] },
    { category: "backend", items: [{ name: "Node.js" }] }
]

describe("ProjectStack", () => {
    it("não renderiza nada sem nenhum item", () => {
        const { container } = render(<ProjectStack stack={[{ category: "frontend", items: [] }]} />)

        expect(container).toBeEmptyDOMElement()
    })

    it("omite a categoria sem item", () => {
        render(
            <ProjectStack
                stack={[
                    { category: "frontend", items: [{ name: "React" }] },
                    { category: "backend", items: [] }
                ]}
            />
        )

        expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1)
        expect(screen.queryByRole("heading", { name: "Backend" })).not.toBeInTheDocument()
    })

    it("mostra h2, um h3 por categoria na ordem fixa e os itens como texto sem link", () => {
        render(<ProjectStack stack={STACK} />)
        const headings = screen.getAllByRole("heading", { level: 3 })

        expect(screen.getByRole("heading", { level: 2, name: "Stack" })).toBeInTheDocument()
        expect(headings.map((heading) => heading.textContent)).toEqual([
            "Frontend",
            "Backend",
            "Infra e ferramentas"
        ])
        expect(screen.getAllByRole("list")).toHaveLength(3)
        expect(screen.queryAllByRole("link")).toHaveLength(0)
        expect(
            within(screen.getAllByRole("list")[0])
                .getAllByRole("listitem")
                .map((item) => item.textContent)
        ).toEqual(["React", "TypeScript"])
    })

    it("traduz os títulos e mantém os itens iguais, sem lang próprio", async () => {
        const { container } = render(<ProjectStack stack={STACK} />)
        await act(() => setLanguage("en"))

        expect(
            screen.getByRole("heading", { level: 3, name: "Infra and tooling" })
        ).toBeInTheDocument()
        expect(screen.getByText("React")).toBeInTheDocument()
        expect(container.querySelector("[lang]")).not.toBeInTheDocument()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<ProjectStack stack={STACK} />)

        await expectNoAxeViolations(container)
    }, 15000)
})
