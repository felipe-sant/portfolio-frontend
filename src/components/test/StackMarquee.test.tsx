import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import StackMarquee from "@/components/StackMarquee"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

const items = [
    { name: "React", isPrimary: true },
    { name: "TypeScript", isPrimary: true },
    { name: "Node.js", isPrimary: false }
]

function renderMarquee() {
    return render(<StackMarquee items={items} heading="Stack" />)
}

afterEach(() => {
    vi.unstubAllGlobals()
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

    it("não renderiza botão nem cópia com movimento reduzido", () => {
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        const { container } = renderMarquee()

        expect(screen.queryByRole("button")).not.toBeInTheDocument()
        expect(container.querySelector('ul[aria-hidden="true"]')).toBeNull()
        expect(screen.getAllByRole("listitem")).toHaveLength(items.length)
    })

    it("torna a região rolável por teclado só com movimento reduzido", () => {
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        renderMarquee()

        expect(screen.getByRole("region", { name: "Stack" })).toHaveAttribute("tabindex", "0")
    })

    it("torna a região rolável, sem cópia, em tela de toque com movimento pleno", () => {
        vi.stubGlobal(
            "matchMedia",
            vi.fn(() => ({
                matches: true,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn()
            }))
        )
        const { container } = renderMarquee()

        expect(screen.getByRole("region", { name: "Stack" })).toHaveAttribute("tabindex", "0")
        expect(container.querySelector('ul[aria-hidden="true"]')).toBeNull()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderMarquee()

        await expectNoAxeViolations(container)
    }, 15000)
})
