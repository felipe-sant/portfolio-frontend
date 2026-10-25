import { afterEach, describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import StackMarquee from "@/components/StackMarquee"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

const items = [
    { name: "React", isPrimary: true },
    { name: "TypeScript", isPrimary: true },
    { name: "Node.js", isPrimary: false }
]

function renderMarquee() {
    return render(<StackMarquee items={items} heading="Stack" pauseLabel="Pausar animação" />)
}

afterEach(() => {
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
})

describe("StackMarquee", () => {
    it("expõe uma região com título de nível 2", () => {
        renderMarquee()

        expect(screen.getByRole("heading", { level: 2, name: "Stack" })).toBeInTheDocument()
        expect(screen.getByRole("region", { name: "Stack" })).toBeInTheDocument()
    })

    it("expõe uma única lista ao leitor de tela com os nomes", () => {
        renderMarquee()

        const list = screen.getByRole("list")
        const names = within(list)
            .getAllByRole("listitem")
            .map((item) => item.textContent)

        expect(names).toEqual(["React", "TypeScript", "Node.js"])
    })

    it("renderiza a cópia oculta com o mesmo número de itens", () => {
        const { container } = renderMarquee()

        const copy = container.querySelector('ul[aria-hidden="true"]')

        expect(copy).not.toBeNull()
        expect(copy?.querySelectorAll("li")).toHaveLength(items.length)
    })

    it("alterna a pausa e troca o ícone", async () => {
        const user = userEvent.setup()
        const { container } = renderMarquee()
        const button = screen.getByRole("button", { name: "Pausar animação" })

        expect(button).toHaveAttribute("aria-pressed", "false")
        expect(container.querySelector("button svg polygon")).toBeNull()

        await user.click(button)

        expect(button).toHaveAttribute("aria-pressed", "true")
        expect(container.querySelector("button svg polygon")).not.toBeNull()

        await user.click(button)

        expect(button).toHaveAttribute("aria-pressed", "false")
        expect(container.querySelector("button svg polygon")).toBeNull()
    })

    it("não renderiza botão nem cópia com movimento reduzido", () => {
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        const { container } = renderMarquee()

        expect(screen.queryByRole("button")).not.toBeInTheDocument()
        expect(container.querySelector('ul[aria-hidden="true"]')).toBeNull()
        expect(screen.getAllByRole("listitem")).toHaveLength(items.length)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderMarquee()

        await expectNoAxeViolations(container)
    }, 15000)
})
