import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { fireEvent, render, screen, within } from "@testing-library/react"
import ProjectsFilterBar from "@/components/ProjectsFilterBar"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

function renderFilterBar(typeValue: string, categoryValue: string | undefined) {
    const ref = createRef<HTMLDivElement>()
    const setType = vi.fn()
    const setCategory = vi.fn()
    const onPointerDown = vi.fn()
    const onPointerMove = vi.fn()

    const view = render(
        <ProjectsFilterBar
            filterBar={{
                ref,
                dragProps: { onPointerDown, onPointerMove },
                typeValue,
                typeOptions: [
                    { value: "", label: "Todos" },
                    { value: "web", label: "Web" },
                    { value: "api", label: "API" }
                ],
                categoryOptions: [
                    { value: "", label: "Todas" },
                    { value: "personal", label: "Pessoais" },
                    { value: "academic", label: "Acadêmicos" }
                ],
                setType,
                setCategory
            }}
            categoryValue={categoryValue}
        />
    )

    return { ...view, ref, setType, setCategory, onPointerDown, onPointerMove }
}

describe("ProjectsFilterBar", () => {
    it("renderiza os grupos Tipo e Categoria com seus rótulos", () => {
        renderFilterBar("", "personal")

        expect(screen.getByRole("group", { name: "Tipo" })).toBeInTheDocument()
        expect(screen.getByRole("group", { name: "Categoria" })).toBeInTheDocument()
    })

    it("marca com aria-pressed a opção do valor recebido em cada grupo", () => {
        renderFilterBar("web", "personal")

        const type = within(screen.getByRole("group", { name: "Tipo" }))
        const category = within(screen.getByRole("group", { name: "Categoria" }))

        expect(type.getByRole("button", { name: "Web" })).toHaveAttribute("aria-pressed", "true")
        expect(type.getByRole("button", { name: "Todos" })).toHaveAttribute("aria-pressed", "false")
        expect(category.getByRole("button", { name: "Pessoais" })).toHaveAttribute(
            "aria-pressed",
            "true"
        )
    })

    it("sem categoria definida nenhuma opção de categoria fica marcada", () => {
        renderFilterBar("", undefined)

        const category = within(screen.getByRole("group", { name: "Categoria" }))

        expect(category.queryAllByRole("button", { pressed: true })).toHaveLength(0)
    })

    it("clicar numa opção de tipo chama setType com o valor", async () => {
        const user = userEvent.setup()
        const { setType, setCategory } = renderFilterBar("", "personal")

        await user.click(screen.getByRole("button", { name: "API" }))

        expect(setType).toHaveBeenCalledWith("api")
        expect(setCategory).not.toHaveBeenCalled()
    })

    it("clicar numa opção de categoria chama setCategory com o valor", async () => {
        const user = userEvent.setup()
        const { setType, setCategory } = renderFilterBar("", "personal")

        await user.click(screen.getByRole("button", { name: "Acadêmicos" }))

        expect(setCategory).toHaveBeenCalledWith("academic")
        expect(setType).not.toHaveBeenCalled()
    })

    it("coloca ref e dragProps no contêiner dos grupos", () => {
        const { ref, onPointerDown, onPointerMove } = renderFilterBar("", "personal")

        const bar = ref.current

        if (!bar) {
            throw new Error("Contêiner dos filtros ausente")
        }

        expect(bar).toContainElement(screen.getByRole("group", { name: "Tipo" }))
        expect(bar).toContainElement(screen.getByRole("group", { name: "Categoria" }))

        fireEvent.pointerDown(bar)
        fireEvent.pointerMove(bar)

        expect(onPointerDown).toHaveBeenCalledTimes(1)
        expect(onPointerMove).toHaveBeenCalledTimes(1)
    })

    it("o separador entre os grupos fica oculto para leitores de tela", () => {
        const { container } = renderFilterBar("", "personal")

        const separator = container.querySelector("span[aria-hidden='true']")

        expect(separator).toBeInTheDocument()
        expect(separator?.previousElementSibling).toBe(screen.getByRole("group", { name: "Tipo" }))
        expect(separator?.nextElementSibling).toBe(screen.getByRole("group", { name: "Categoria" }))
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderFilterBar("web", "personal")

        await expectNoAxeViolations(container)
    })
})
