import { afterEach, describe, expect, it } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SettingsMenu from "@/components/SettingsMenu"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

afterEach(() => {
    localStorage.removeItem(MOTION_STORAGE_KEY)
    localStorage.removeItem(THEME_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
    document.documentElement.removeAttribute("data-theme")
})

describe("SettingsMenu", () => {
    it("começa fechado, só com o botão Configurações", () => {
        render(<SettingsMenu />)

        expect(screen.getByRole("button", { name: "Configurações" })).toHaveAttribute(
            "aria-expanded",
            "false"
        )
        expect(screen.queryByRole("button", { name: "Tema escuro" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Reduzir movimento" })).not.toBeInTheDocument()
    })

    it("abre com tema e movimento", async () => {
        render(<SettingsMenu />)

        await userEvent.click(screen.getByRole("button", { name: "Configurações" }))

        expect(screen.getByRole("button", { name: "Configurações" })).toHaveAttribute(
            "aria-expanded",
            "true"
        )
        expect(screen.getByRole("button", { name: "Tema escuro" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Reduzir movimento" })).toBeInTheDocument()
    })

    it("mantém aberto ao alternar tema e movimento", async () => {
        render(<SettingsMenu />)
        await userEvent.click(screen.getByRole("button", { name: "Configurações" }))

        await userEvent.click(screen.getByRole("button", { name: "Tema escuro" }))
        await userEvent.click(screen.getByRole("button", { name: "Reduzir movimento" }))

        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark")
        expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe("reduced")
        expect(screen.getByRole("button", { name: "Configurações" })).toHaveAttribute(
            "aria-expanded",
            "true"
        )
    })

    it("fecha com Escape e devolve o foco ao botão", async () => {
        render(<SettingsMenu />)
        await userEvent.click(screen.getByRole("button", { name: "Configurações" }))

        await userEvent.keyboard("{Escape}")

        await waitFor(() =>
            expect(screen.queryByRole("button", { name: "Tema escuro" })).not.toBeInTheDocument()
        )
        expect(screen.getByRole("button", { name: "Configurações" })).toHaveFocus()
    })

    it("não tem violações de acessibilidade fechado e aberto", async () => {
        const { container } = render(<SettingsMenu />)

        await expectNoAxeViolations(container)
        await userEvent.click(screen.getByRole("button", { name: "Configurações" }))
        await expectNoAxeViolations(container)
    }, 15000)
})
