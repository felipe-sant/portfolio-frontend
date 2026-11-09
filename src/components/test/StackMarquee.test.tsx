import { afterEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import StackMarquee from "@/components/StackMarquee"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

const items = [
    { name: "React", isPrimary: true },
    { name: "TypeScript", isPrimary: true },
    { name: "Node.js", isPrimary: false }
]

function stubTouchPointer() {
    vi.stubGlobal(
        "matchMedia",
        vi.fn((query: string) => ({
            matches: query === "(pointer: coarse)",
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        }))
    )
}

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

    it("torna a região focável por teclado também com movimento pleno", () => {
        renderMarquee()

        expect(screen.getByRole("region", { name: "Stack" })).toHaveAttribute("tabindex", "0")
    })

    it("pausa com o mouse sobre a região e retoma ao sair", async () => {
        const user = userEvent.setup()
        renderMarquee()
        const region = screen.getByRole("region", { name: "Stack" })

        expect(region).not.toHaveAttribute("data-paused")

        await user.hover(region)
        expect(region).toHaveAttribute("data-paused", "true")

        await user.unhover(region)
        expect(region).not.toHaveAttribute("data-paused")
    })

    it("pausa com o foco de teclado na região e retoma ao sair", async () => {
        const user = userEvent.setup()
        renderMarquee()
        const region = screen.getByRole("region", { name: "Stack" })

        await user.tab()
        expect(region).toHaveFocus()
        expect(region).toHaveAttribute("data-paused", "true")

        await user.tab()
        expect(region).not.toHaveAttribute("data-paused")
    })

    it("não define pausa com movimento reduzido", async () => {
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        const user = userEvent.setup()
        renderMarquee()
        const region = screen.getByRole("region", { name: "Stack" })

        await user.hover(region)
        expect(region).not.toHaveAttribute("data-paused")

        await user.unhover(region)
        await user.tab()
        expect(region).not.toHaveAttribute("data-paused")
    })

    it("pausa com um toque e retoma com o toque seguinte, sem prender a pausa pelo foco", () => {
        renderMarquee()
        const region = screen.getByRole("region", { name: "Stack" })

        fireEvent.pointerDown(region, { pointerType: "touch" })
        fireEvent.pointerUp(region, { pointerType: "touch" })
        fireEvent.focus(region)
        expect(region).toHaveAttribute("data-paused", "true")

        fireEvent.pointerDown(region, { pointerType: "touch" })
        fireEvent.pointerUp(region, { pointerType: "touch" })
        expect(region).not.toHaveAttribute("data-paused")
    })

    it("não define pausa por toque com movimento reduzido", () => {
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        renderMarquee()
        const region = screen.getByRole("region", { name: "Stack" })

        fireEvent.pointerDown(region, { pointerType: "touch" })
        fireEvent.pointerUp(region, { pointerType: "touch" })

        expect(region).not.toHaveAttribute("data-paused")
    })

    it("solta a pausa por toque quando o movimento passa a reduzido", async () => {
        renderMarquee()
        const region = screen.getByRole("region", { name: "Stack" })

        fireEvent.pointerDown(region, { pointerType: "touch" })
        fireEvent.pointerUp(region, { pointerType: "touch" })
        expect(region).toHaveAttribute("data-paused", "true")

        act(() => {
            localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
            window.dispatchEvent(new StorageEvent("storage", { key: MOTION_STORAGE_KEY }))
        })
        act(() => {
            localStorage.removeItem(MOTION_STORAGE_KEY)
            window.dispatchEvent(new StorageEvent("storage", { key: MOTION_STORAGE_KEY }))
        })

        expect(region).not.toHaveAttribute("data-paused")
    })

    it("não tem violações de acessibilidade com a região pausada", async () => {
        const user = userEvent.setup()
        const { container } = renderMarquee()

        await user.hover(screen.getByRole("region", { name: "Stack" }))

        await expectNoAxeViolations(container)
    })

    it("torna a região rolável por teclado com movimento reduzido", () => {
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        renderMarquee()

        expect(screen.getByRole("region", { name: "Stack" })).toHaveAttribute("tabindex", "0")
    })

    it("renderiza a cópia do laço em tela de toque com movimento pleno", () => {
        stubTouchPointer()
        const { container } = renderMarquee()

        expect(screen.getByRole("region", { name: "Stack" })).toHaveAttribute("tabindex", "0")
        expect(
            container.querySelector('ul[aria-hidden="true"]')?.querySelectorAll("li")
        ).toHaveLength(items.length)
    })

    it("não renderiza a cópia em tela de toque com movimento reduzido", () => {
        stubTouchPointer()
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        const { container } = renderMarquee()

        expect(screen.getByRole("region", { name: "Stack" })).toHaveAttribute("tabindex", "0")
        expect(container.querySelector('ul[aria-hidden="true"]')).toBeNull()
        expect(screen.getAllByRole("listitem")).toHaveLength(items.length)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderMarquee()

        await expectNoAxeViolations(container)
    })
})
