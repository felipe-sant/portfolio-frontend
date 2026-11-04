import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import openPreferences from "./support/openPreferences"

const THEME_COLORS = { light: "#fbf9f5", dark: "#141210" }

type Theme = "light" | "dark"

function opposite(theme: Theme): Theme {
    return theme === "dark" ? "light" : "dark"
}

async function openHome(page: Page) {
    await page.goto("pt-BR")
    await page.getByRole("heading", { level: 1 }).waitFor()
}

async function getThemeToggle(page: Page) {
    const panel = await openPreferences(page)
    return panel.getByRole("button", { name: "Tema escuro" })
}

test.describe("tema", () => {
    test("RF-LAY-18, A11Y-L07: o botão alterna o data-theme e o aria-pressed sem mover o foco", async ({
        page,
        colorScheme
    }) => {
        const system: Theme = colorScheme === "dark" ? "dark" : "light"
        await openHome(page)
        const toggle = await getThemeToggle(page)
        const html = page.locator("html")

        await expect(html).toHaveAttribute("data-theme", system)
        await expect(toggle).toHaveAttribute("aria-pressed", String(system === "dark"))

        await toggle.click()
        await expect(html).toHaveAttribute("data-theme", opposite(system))
        await expect(toggle).toHaveAttribute("aria-pressed", String(system !== "dark"))
        await expect(toggle).toBeFocused()

        await toggle.click()
        await expect(html).toHaveAttribute("data-theme", system)
        await expect(toggle).toHaveAttribute("aria-pressed", String(system === "dark"))
        await expect(toggle).toBeFocused()
    })

    test("RF-LAY-16, NF-TE-02: a escolha clicada fica salva após recarregar", async ({
        page,
        colorScheme
    }) => {
        const system: Theme = colorScheme === "dark" ? "dark" : "light"
        await openHome(page)
        await (await getThemeToggle(page)).click()
        await expect(page.locator("html")).toHaveAttribute("data-theme", opposite(system))

        await page.reload()
        await page.getByRole("heading", { level: 1 }).waitFor()

        await expect(page.locator("html")).toHaveAttribute("data-theme", opposite(system))
        await expect(await getThemeToggle(page)).toHaveAttribute(
            "aria-pressed",
            String(system !== "dark")
        )
    })

    test("RF-LAY-16, NF-TE-02: a escolha salva vale mais que o tema do sistema", async ({
        page
    }) => {
        await page.emulateMedia({ colorScheme: "light" })
        await openHome(page)
        await (await getThemeToggle(page)).click()
        await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")

        await page.reload()
        await page.getByRole("heading", { level: 1 }).waitFor()

        await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
    })

    test("RF-LAY-16: sem escolha salva o tema acompanha o sistema, inclusive ao mudar com a página aberta", async ({
        page
    }) => {
        await page.emulateMedia({ colorScheme: "light" })
        await openHome(page)
        await expect(page.locator("html")).toHaveAttribute("data-theme", "light")

        await page.emulateMedia({ colorScheme: "dark" })
        await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")

        await page.emulateMedia({ colorScheme: "light" })
        await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
    })

    test("RF-LAY-17, NF-TE-03: o tema salvo é aplicado pelo script inline antes do bundle", async ({
        page,
        colorScheme
    }) => {
        const system: Theme = colorScheme === "dark" ? "dark" : "light"
        const saved = opposite(system)
        await page.addInitScript((value) => {
            localStorage.setItem("portfolio-frontend:theme", value)
        }, saved)
        await page.route("**/assets/*.js", (route) => route.abort())

        await page.goto("pt-BR")

        await expect(page.locator("html")).toHaveAttribute("data-theme", saved)
        const colors = await page
            .locator('meta[name="theme-color"]')
            .evaluateAll((metas) => metas.map((meta) => meta.getAttribute("content")))
        expect(colors.length).toBeGreaterThan(0)
        expect(new Set(colors)).toEqual(new Set([THEME_COLORS[saved]]))
    })

    test("RF-LAY-19: ?tema= na URL é ignorado e o tema segue o sistema", async ({
        page,
        colorScheme
    }) => {
        const system: Theme = colorScheme === "dark" ? "dark" : "light"

        await page.goto(`pt-BR?tema=${opposite(system)}`)
        await page.getByRole("heading", { level: 1 }).waitFor()

        await expect(page.locator("html")).toHaveAttribute("data-theme", system)
    })
})
