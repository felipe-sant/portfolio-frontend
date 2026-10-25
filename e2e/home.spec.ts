import { expect, test } from "@playwright/test"

const HIT_MIN = 44
const BREAKPOINT_WIDTH = 640

test.describe("movimento pleno", () => {
    test.use({ reducedMotion: "no-preference" })

    test.beforeEach(async ({ page }) => {
        await page.goto("pt-BR")
        await page.getByRole("heading", { level: 1 }).waitFor()
    })

    test("o botão de pausa alterna aria-pressed e a pausa não é salva", async ({ page }) => {
        const button = page.getByRole("button", { name: "Pausar faixa de tecnologias" })

        await expect(button).toHaveAttribute("aria-pressed", "false")
        await button.click()
        await expect(button).toHaveAttribute("aria-pressed", "true")
        await button.click()
        await expect(button).toHaveAttribute("aria-pressed", "false")

        await button.click()
        await page.reload()
        await expect(
            page.getByRole("button", { name: "Pausar faixa de tecnologias" })
        ).toHaveAttribute("aria-pressed", "false")
    })

    test("o botão de pausa e os links principais têm alvo de 44px", async ({ page }) => {
        const targets = [
            page.getByRole("button", { name: "Pausar faixa de tecnologias" }),
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

    test("o botão de pausa mostra foco visível ao receber foco por teclado", async ({ page }) => {
        const button = page.getByRole("button", { name: "Pausar faixa de tecnologias" })

        await button.focus()
        await page.keyboard.press("Shift+Tab")
        await page.keyboard.press("Tab")

        await expect(button).toBeFocused()
        const outlineWidth = await button.evaluate(
            (element) => getComputedStyle(element).outlineWidth
        )
        expect(parseFloat(outlineWidth)).toBeGreaterThanOrEqual(2)
    })
})

test.describe("estrutura da página", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("pt-BR")
        await page.getByRole("heading", { level: 1 }).waitFor()
    })

    test("com movimento reduzido a faixa não tem botão de pausa", async ({ page }) => {
        await expect(page.getByRole("button", { name: "Pausar faixa de tecnologias" })).toHaveCount(
            0
        )
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
