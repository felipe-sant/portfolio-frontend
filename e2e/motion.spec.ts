import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import openPreferences from "./support/openPreferences"
import readStackOffset from "./support/readStackOffset"

const STACK_HEADING = "Tecnologias que uso"
const MOVEMENT_THRESHOLD = 5

function getStackBand(page: Page) {
    return page.getByRole("region", { name: STACK_HEADING })
}

async function openHome(page: Page) {
    await page.goto("pt-BR")
    await getStackBand(page).waitFor()
}

async function getMotionToggle(page: Page) {
    const panel = await openPreferences(page)
    return panel.getByRole("button", { name: "Reduzir movimento" })
}

async function expectStackMoving(page: Page) {
    const before = await readStackOffset(page, STACK_HEADING)
    await expect
        .poll(async () => Math.abs((await readStackOffset(page, STACK_HEADING)) - before), {
            timeout: 5000
        })
        .toBeGreaterThan(MOVEMENT_THRESHOLD)
}

async function expectStackStill(page: Page) {
    await expect(getStackBand(page).locator("ul[aria-hidden='true']")).toHaveCount(0)
    expect(await readStackOffset(page, STACK_HEADING)).toBe(0)
    await expect(getStackBand(page).locator("div").first()).toHaveCSS("animation-name", "none")
}

test.describe("movimento com o sistema em movimento pleno", () => {
    test.use({ reducedMotion: "no-preference" })

    test("RF-LAY-35: o botão liga e desliga o data-motion reduzido e o aria-pressed", async ({
        page
    }) => {
        await openHome(page)
        const toggle = await getMotionToggle(page)
        const html = page.locator("html")

        await expect(html).toHaveAttribute("data-motion", "full")
        await expect(toggle).toHaveAttribute("aria-pressed", "false")

        await toggle.click()
        await expect(html).toHaveAttribute("data-motion", "reduced")
        await expect(toggle).toHaveAttribute("aria-pressed", "true")

        await toggle.click()
        await expect(html).toHaveAttribute("data-motion", "full")
        await expect(toggle).toHaveAttribute("aria-pressed", "false")
    })

    test("RF-LAY-35, NF-MO-01, RF-HOME-14: a faixa se move com movimento pleno e para ao reduzir", async ({
        page
    }) => {
        await openHome(page)
        await expect(getStackBand(page).locator("ul[aria-hidden='true']")).toHaveCount(1)
        await expectStackMoving(page)

        await (await getMotionToggle(page)).click()

        await expectStackStill(page)
    })

    test("RF-LAY-35: a escolha de reduzir fica salva após recarregar", async ({ page }) => {
        await openHome(page)
        await (await getMotionToggle(page)).click()
        await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced")

        await page.reload()
        await getStackBand(page).waitFor()

        await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced")
        await expect(await getMotionToggle(page)).toHaveAttribute("aria-pressed", "true")
    })

    test("RF-LAY-35, NF-MO-01: o script inline aplica a escolha salva pelo botão antes do bundle", async ({
        page
    }) => {
        await openHome(page)
        await (await getMotionToggle(page)).click()
        await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced")
        await page.route("**/assets/*.js", (route) => route.abort())

        await page.reload()

        await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced")
    })

    test("RF-LAY-35, RF-HOME-15: reduzir vale mais que o sistema em movimento pleno", async ({
        page
    }) => {
        await openHome(page)
        await (await getMotionToggle(page)).click()

        await page.reload()
        await getStackBand(page).waitFor()

        await expectStackStill(page)
    })
})

test.describe("movimento com o sistema em movimento reduzido", () => {
    test.use({ reducedMotion: "reduce" })

    test("NF-MO-01: a animação da faixa é nenhuma e os destaques já aparecem visíveis", async ({
        page
    }) => {
        await openHome(page)
        await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced")
        await page.getByRole("article").first().waitFor()

        await expectStackStill(page)
        const states = await page
            .locator("[data-reveal]")
            .evaluateAll((elements) =>
                elements.map((element) => element.getAttribute("data-reveal"))
            )
        expect(states.length).toBeGreaterThan(0)
        expect(new Set(states)).toEqual(new Set(["visible"]))
    })

    test("RF-LAY-35, RF-HOME-15: a escolha de movimento pleno vale mais que o sistema reduzido", async ({
        page
    }) => {
        await openHome(page)
        await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced")
        await (await getMotionToggle(page)).click()
        await expect(page.locator("html")).toHaveAttribute("data-motion", "full")

        await page.reload()
        await getStackBand(page).waitFor()

        await expect(page.locator("html")).toHaveAttribute("data-motion", "full")
        await expectStackMoving(page)
    })
})
