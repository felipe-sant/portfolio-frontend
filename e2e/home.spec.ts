import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

const HIT_MIN = 44
const BREAKPOINT_WIDTH = 640
const LANGUAGES = ["pt-BR", "en", "es"]
const STACK_HEADING = "Tecnologias que uso"
const DRAG_DISTANCE = 300

function readMarqueeOffset(page: Page) {
    return page
        .locator("section[aria-labelledby]", {
            has: page.getByRole("heading", { name: STACK_HEADING })
        })
        .locator("div")
        .first()
        .evaluate((track) => new DOMMatrix(getComputedStyle(track).transform).m41)
}

function getStackBand(page: Page) {
    return page.getByRole("region", { name: STACK_HEADING })
}

test.describe("movimento pleno", () => {
    test.use({ reducedMotion: "no-preference" })

    test.beforeEach(async ({ page }) => {
        await page.goto("pt-BR")
        await page.getByRole("heading", { level: 1 }).waitFor()
    })

    test("os links principais têm alvo de 44px", async ({ page }) => {
        const targets = [
            page.getByRole("link", { name: /Ver projetos/ }),
            page.getByRole("link", { name: "Baixar CV (PDF), abre a pré-visualização" }),
            page.getByRole("link", { name: "Ler sobre mim" })
        ]

        for (const target of targets) {
            const box = await target.boundingBox()
            expect(box?.height ?? 0).toBeGreaterThanOrEqual(HIT_MIN)
            expect(box?.width ?? 0).toBeGreaterThanOrEqual(HIT_MIN)
        }
    })
})

test.describe("faixa de tecnologias com movimento pleno", () => {
    test.use({ reducedMotion: "no-preference" })

    test.beforeEach(async ({ page }) => {
        await page.goto("pt-BR")
        await getStackBand(page).waitFor()
    })

    test("não tem botão de pausa e fica sem foco por teclado", async ({ page }) => {
        await expect(page.getByRole("button", { name: /paus/i })).toHaveCount(0)
        await expect(getStackBand(page)).not.toHaveAttribute("tabindex", /.*/)
    })

    test("tem uma cópia escondida da lista para o ciclo contínuo", async ({ page }) => {
        await expect(getStackBand(page).locator("ul[aria-hidden='true']")).toHaveCount(1)
    })

    test("continua se movendo com o mouse em cima", async ({ page }) => {
        const band = getStackBand(page)
        await band.scrollIntoViewIfNeeded()
        await band.hover()
        const before = await readMarqueeOffset(page)

        await expect
            .poll(async () => Math.abs((await readMarqueeOffset(page)) - before), { timeout: 5000 })
            .toBeGreaterThan(5)
    })
})

test.describe("faixa de tecnologias com movimento reduzido", () => {
    test.use({ reducedMotion: "reduce" })

    test.beforeEach(async ({ page }) => {
        await page.goto("pt-BR")
        await expect(getStackBand(page)).toHaveAttribute("tabindex", "0")
    })

    test("não tem cópia escondida da lista", async ({ page }) => {
        await expect(getStackBand(page).locator("[aria-hidden='true']")).toHaveCount(0)
    })

    test("rola na horizontal ao arrastar com o mouse", async ({ page }) => {
        const band = getStackBand(page)
        await band.scrollIntoViewIfNeeded()

        await expect
            .poll(async () => {
                const box = await band.boundingBox()
                if (!box) {
                    return 0
                }
                const y = box.y + box.height / 2
                await page.mouse.move(box.x + box.width - 100, y)
                await page.mouse.down()
                await page.mouse.move(box.x + box.width - 100 - DRAG_DISTANCE, y, { steps: 8 })
                await page.mouse.up()
                return band.evaluate((element) => element.scrollLeft)
            })
            .toBeGreaterThan(0)
    })

    test("rola na horizontal com as setas quando focada", async ({ page }) => {
        const band = getStackBand(page)
        await band.scrollIntoViewIfNeeded()
        await band.focus()
        await expect(band).toBeFocused()

        await page.keyboard.press("ArrowRight")
        await page.keyboard.press("ArrowRight")

        await expect.poll(() => band.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
    })
})

test.describe("entrada dos destaques ao rolar", () => {
    test.describe("com movimento reduzido", () => {
        test.use({ reducedMotion: "reduce" })

        test("todos já aparecem visíveis", async ({ page }) => {
            await page.goto("pt-BR")
            await page.getByRole("article").first().waitFor()

            const states = await page
                .locator("[data-reveal]")
                .evaluateAll((elements) =>
                    elements.map((element) => element.getAttribute("data-reveal"))
                )
            expect(states.length).toBeGreaterThan(0)
            expect(new Set(states)).toEqual(new Set(["visible"]))
        })
    })

    test.describe("com movimento pleno", () => {
        test.use({ reducedMotion: "no-preference" })

        test("o destaque fora da tela começa escondido e aparece ao rolar até ele", async ({
            page
        }) => {
            await page.goto("pt-BR")
            const items = page.getByRole("article")
            await items.first().waitFor()
            const last = items.last()

            await expect(last).toHaveAttribute("data-reveal", "hidden")
            await last.scrollIntoViewIfNeeded()
            await expect(last).toHaveAttribute("data-reveal", "visible")
        })
    })
})

test.describe("menu de configurações", () => {
    test("separa preferências e acessibilidade em grupos com nome", async ({ page }) => {
        test.skip(
            (page.viewportSize()?.width ?? 0) < BREAKPOINT_WIDTH,
            "o menu existe só no desktop"
        )
        await page.goto("pt-BR")
        await page.getByRole("heading", { level: 1 }).waitFor()
        await page.getByRole("button", { name: "Configurações" }).click()

        const preferences = page.getByRole("group", { name: "Preferências" })
        const accessibility = page.getByRole("group", { name: "Acessibilidade" })
        await expect(preferences.getByRole("button", { name: "Tema escuro" })).toBeVisible()
        await expect(accessibility.getByRole("button", { name: "Reduzir movimento" })).toBeVisible()
        await expect(page.getByRole("group")).toHaveCount(2)
    })
})

test.describe("carga da página", () => {
    for (const language of LANGUAGES) {
        test(`não registra erro no console em ${language}`, async ({ page }) => {
            const problems: string[] = []
            page.on("console", (message) => {
                if (message.type() === "error" || message.type() === "warning") {
                    problems.push(`${message.type()}: ${message.text()}`)
                }
            })
            page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`))

            await page.goto(language)
            await page.getByRole("heading", { level: 1 }).waitFor()
            await expect(page.getByRole("article").first()).toBeVisible()
            await page.waitForLoadState("networkidle")

            expect(problems).toEqual([])
        })
    }
})

test.describe("estrutura da página", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("pt-BR")
        await page.getByRole("heading", { level: 1 }).waitFor()
    })

    test("os destaques alternam a imagem a partir de 640px", async ({ page }) => {
        const items = page.getByRole("article")
        await expect(items.first()).toBeVisible()
        const count = await items.count()
        test.skip(count < 2, "o conteúdo tem menos de dois destaques")

        const positions = []
        for (let index = 0; index < 2; index++) {
            const item = items.nth(index)
            const image = await item.locator("img, [aria-hidden='true']").first().boundingBox()
            const title = await item.getByRole("heading", { level: 3 }).boundingBox()
            positions.push({ image, title })
        }

        const isWide = (page.viewportSize()?.width ?? 0) >= BREAKPOINT_WIDTH
        const [first, second] = positions

        if (isWide) {
            expect(first.image?.x ?? 0).toBeLessThan(first.title?.x ?? 0)
            expect(second.image?.x ?? 0).toBeGreaterThan(second.title?.x ?? 0)
        } else {
            expect(first.image?.y ?? 0).toBeLessThan(first.title?.y ?? 0)
            expect(second.image?.y ?? 0).toBeLessThan(second.title?.y ?? 0)
        }
    })

    test("cada destaque tem um único link, no título", async ({ page }) => {
        const items = page.getByRole("article")
        await expect(items.first()).toBeVisible()

        for (let index = 0; index < (await items.count()); index++) {
            await expect(items.nth(index).getByRole("link")).toHaveCount(1)
        }
    })

    test("os links de saída e do cabeçalho da seção têm alvo de 44px", async ({ page }) => {
        const links = page.getByRole("link", { name: "Ver todos os projetos" })

        for (let index = 0; index < (await links.count()); index++) {
            const box = await links.nth(index).boundingBox()
            expect(box?.height ?? 0).toBeGreaterThanOrEqual(HIT_MIN)
        }
    })
})
