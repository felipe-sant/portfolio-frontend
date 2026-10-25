import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import readAppVersion from "./support/readAppVersion"
import readProfile from "./support/readProfile"
import UI_TEXTS from "./support/uiTexts"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const AUTHOR = "Luiz Felipe dos Santos"
const RESET_TIMEOUT = 8000

async function openHome(page: Page, language: string = "pt-BR") {
    await page.goto(language)
    await page.getByRole("heading", { level: 1 }).waitFor()
}

test.describe("rodapé", () => {
    test("RF-LAY-20: o rodapé é o landmark contentinfo", async ({ page }) => {
        await openHome(page)

        await expect(page.getByRole("contentinfo")).toBeVisible()
    })

    for (const language of LANGUAGES) {
        test(`RF-LAY-21: o e-mail e a disponibilidade de ${language} vêm do conteúdo do idioma`, async ({
            page
        }) => {
            const profile = readProfile(language)
            await openHome(page, language)

            const footer = page.getByRole("contentinfo")
            await expect(footer).toContainText(profile.email)
            await expect(footer).toContainText(profile.availabilityLabel)
        })

        test(`RF-LAY-22, RF-LAY-15: o botão de contato em ${language} aponta para a tela de contato do idioma e leva até ela`, async ({
            page
        }) => {
            await openHome(page, language)
            const cta = page
                .getByRole("contentinfo")
                .getByRole("link", { name: UI_TEXTS[language].contactCta })

            await expect(cta).toHaveAttribute("href", `${FATEC_BASE_PATH}${language}/contact`)
            await cta.click()

            await expect(page).toHaveURL(new RegExp(`/${language}/contact$`))
        })
    }

    test("RF-LAY-24: GitHub e LinkedIn abrem em nova aba com o perfil do conteúdo e rel seguro", async ({
        page
    }) => {
        const profile = readProfile("pt-BR")
        await openHome(page)
        const footer = page.getByRole("contentinfo")
        const expected = [
            { name: `GitHub de ${AUTHOR} (abre em nova aba)`, href: profile.github },
            { name: `LinkedIn de ${AUTHOR} (abre em nova aba)`, href: profile.linkedin }
        ]

        for (const { name, href } of expected) {
            const link = footer.getByRole("link", { name })
            await expect(link).toHaveAttribute("href", href)
            await expect(link).toHaveAttribute("target", "_blank")
            await expect(link).toHaveAttribute("rel", /noopener/)
            await expect(link).toHaveAttribute("rel", /noreferrer/)
        }
    })

    test("RF-LAY-24: o link de e-mail é um mailto com o e-mail do conteúdo e sem nova aba", async ({
        page
    }) => {
        const profile = readProfile("pt-BR")
        await openHome(page)

        const link = page
            .getByRole("contentinfo")
            .getByRole("link", { name: `Enviar e-mail para ${AUTHOR}` })

        await expect(link).toHaveAttribute("href", `mailto:${profile.email}`)
        await expect(link).not.toHaveAttribute("target", /.*/)
    })

    test("RF-LAY-25: a barra inferior mostra o ano atual, o nome e a versão do package.json", async ({
        page
    }) => {
        await openHome(page)

        const footer = page.getByRole("contentinfo")
        await expect(footer).toContainText(`© ${new Date().getFullYear()} · ${AUTHOR}`)
        await expect(footer).toContainText(`v${readAppVersion()}`)
    })
})

test.describe("copiar e-mail", () => {
    test.beforeEach(async ({ context }) => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"])
    })

    test("RF-LAY-23, A11Y-L11: o status nasce vazio e depois de copiar anuncia E-mail copiado com o e-mail do conteúdo na área de transferência", async ({
        page
    }) => {
        const profile = readProfile("pt-BR")
        await openHome(page)
        const footer = page.getByRole("contentinfo")
        const status = footer.getByRole("status")
        const copy = footer.getByRole("button")

        await expect(status).toHaveText("")
        await expect(copy).toHaveText("Copiar e-mail")

        await copy.click()

        await expect(status).toHaveText("E-mail copiado")
        await expect(copy).toHaveText("E-mail copiado")
        expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(profile.email)
    })

    test("RF-LAY-23: o rótulo volta a Copiar e-mail sozinho", async ({ page }) => {
        await openHome(page)
        const footer = page.getByRole("contentinfo")
        const copy = footer.getByRole("button")

        await copy.click()
        await expect(copy).toHaveText("E-mail copiado")

        await expect(copy).toHaveText("Copiar e-mail", { timeout: RESET_TIMEOUT })
        await expect(footer.getByRole("status")).toHaveText("")
    })

    test("RF-LAY-23, A11Y-L11: com a cópia rejeitada o status anuncia Não foi possível copiar", async ({
        page
    }) => {
        await page.addInitScript(() => {
            navigator.clipboard.writeText = () => Promise.reject(new Error("bloqueado"))
        })
        await openHome(page)
        const footer = page.getByRole("contentinfo")

        await footer.getByRole("button").click()

        await expect(footer.getByRole("status")).toHaveText("Não foi possível copiar")
        await expect(footer.getByRole("button")).toHaveText("Não foi possível copiar")
    })
})
