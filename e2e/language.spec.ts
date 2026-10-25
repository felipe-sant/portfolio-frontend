import { expect, test } from "@playwright/test"
import type { Locator, Page } from "@playwright/test"

const DESKTOP_MIN_WIDTH = 640
const SCROLL_TARGET = 600
const SCROLL_TOLERANCE = 5
const LANGUAGE_STORAGE_KEY = "portfolio-frontend:language"
const MARKER = "e2eMarker"

const LANGUAGES = {
    "pt-BR": {
        menu: "Menu",
        button: "Idioma: Português",
        option: "Português",
        heading: "Desenvolvedor full stack em TypeScript",
        title: "Portfolio · Luiz Felipe dos Santos"
    },
    en: {
        menu: "Menu",
        button: "Language: English",
        option: "English",
        heading: "Full stack developer in TypeScript",
        title: "Portfolio · Luiz Felipe dos Santos"
    },
    es: {
        menu: "Menú",
        button: "Idioma: Español",
        option: "Español",
        heading: "Desarrollador full stack en TypeScript",
        title: "Portfolio · Luiz Felipe dos Santos"
    }
}

type Language = keyof typeof LANGUAGES

function isDesktop(page: Page) {
    return (page.viewportSize()?.width ?? 0) >= DESKTOP_MIN_WIDTH
}

async function openMenuOnMobile(page: Page, language: Language) {
    if (isDesktop(page)) {
        return
    }

    const menu = page.getByRole("button", { name: LANGUAGES[language].menu })
    if ((await menu.getAttribute("aria-expanded")) !== "true") {
        await menu.click()
    }
}

async function getLanguageButton(page: Page, language: Language) {
    await openMenuOnMobile(page, language)
    return page.getByRole("button", { name: LANGUAGES[language].button })
}

async function openLanguageList(page: Page, language: Language) {
    const button = await getLanguageButton(page, language)
    await button.click()
    await expect(button).toHaveAttribute("aria-expanded", "true")
    return button
}

async function chooseLanguage(page: Page, from: Language, to: Language) {
    const button = await openLanguageList(page, from)
    await page.getByRole("link", { name: LANGUAGES[to].option, exact: true }).click()
    return button
}

async function openHome(page: Page, language: Language) {
    await page.goto(language)
    await page.getByRole("heading", { level: 1 }).waitFor()
}

async function expectHomeIn(page: Page, language: Language) {
    await expect(page).toHaveURL(new RegExp(`/${language}$`))
    await expect(page.locator("html")).toHaveAttribute("lang", language)
    await expect(page).toHaveTitle(LANGUAGES[language].title)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(LANGUAGES[language].heading)
}

async function clickWithMouse(target: Locator) {
    const box = await target.boundingBox()
    if (!box) {
        throw new Error("o alvo do clique não tem caixa na tela")
    }
    await target.page().mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

function clickOutsideSelector(page: Page): Promise<void> {
    if (isDesktop(page)) {
        return page.getByRole("banner").click({ position: { x: 2, y: 2 } })
    }

    return page.getByText("Tema", { exact: true }).click()
}

async function switchToEnglishByClickAfterScrolling(page: Page) {
    await openHome(page, "pt-BR")
    await page.getByRole("article").last().waitFor()
    await page.evaluate((top) => window.scrollTo(0, top), SCROLL_TARGET)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(SCROLL_TARGET)
    if (!isDesktop(page)) {
        await clickWithMouse(page.getByRole("button", { name: LANGUAGES["pt-BR"].menu }))
    }
    await clickWithMouse(page.getByRole("button", { name: LANGUAGES["pt-BR"].button }))
    await clickWithMouse(page.getByRole("link", { name: LANGUAGES.en.option, exact: true }))
}

test.describe("seletor de idioma", () => {
    test("RF-LAY-13, A11Y-L05: o botão se chama Idioma: Português e a lista traz os três idiomas com hreflang, lang e aria-current só no ativo", async ({
        page
    }) => {
        await openHome(page, "pt-BR")
        await openLanguageList(page, "pt-BR")

        const expected = [
            { name: "Português", language: "pt-BR", current: "true" },
            { name: "English", language: "en", current: null },
            { name: "Español", language: "es", current: null }
        ]
        for (const { name, language, current } of expected) {
            const option = page.getByRole("link", { name, exact: true })
            await expect(option).toHaveAttribute("hreflang", language)
            await expect(option).toHaveAttribute("lang", language)
            if (current) {
                await expect(option).toHaveAttribute("aria-current", current)
            } else {
                await expect(option).not.toHaveAttribute("aria-current", /.*/)
            }
        }
    })

    test("RF-LAY-14, A11Y-L06, NF-IN-05, NF-IN-10: escolher English muda caminho, lang, título e h1 sem recarregar", async ({
        page
    }) => {
        await openHome(page, "pt-BR")
        await page.evaluate((name) => Reflect.set(window, name, true), MARKER)

        await chooseLanguage(page, "pt-BR", "en")

        await expectHomeIn(page, "en")
        expect(await page.evaluate((name) => Reflect.get(window, name), MARKER)).toBe(true)
    })

    test("RF-LAY-14: escolher Español e voltar para Português troca caminho, lang, título e h1", async ({
        page
    }) => {
        await openHome(page, "pt-BR")

        await chooseLanguage(page, "pt-BR", "es")
        await expectHomeIn(page, "es")

        await chooseLanguage(page, "es", "pt-BR")
        await expectHomeIn(page, "pt-BR")
    })

    test("RF-LAY-14, A11Y-L06: depois da troca a lista fecha e o foco volta ao botão do seletor", async ({
        page
    }) => {
        await openHome(page, "pt-BR")

        await chooseLanguage(page, "pt-BR", "en")

        const button = page.getByRole("button", { name: LANGUAGES.en.button })
        await expect(button).toBeFocused()
        await expect(button).toHaveAttribute("aria-expanded", "false")
        await expect(page.getByRole("link", { name: "Español", exact: true })).toHaveCount(0)
    })

    test("RF-LAY-14, A11Y-L06: a troca por clique com a página rolada mostra o idioma novo e devolve o foco ao botão", async ({
        page
    }) => {
        await switchToEnglishByClickAfterScrolling(page)

        await expectHomeIn(page, "en")
        await expect(page.getByRole("button", { name: LANGUAGES.en.button })).toBeFocused()
    })

    test("RF-LAY-14: a troca de idioma por clique preserva a posição de rolagem", async ({
        page
    }) => {
        test.fail(
            isDesktop(page),
            "bug de produto conhecido: o focus() sem preventScroll em LanguageSelector e useDropdown rola a página no desktop; a issue BUG ainda será aberta pelo PO"
        )
        await switchToEnglishByClickAfterScrolling(page)

        await expectHomeIn(page, "en")
        await expect
            .poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - SCROLL_TARGET))
            .toBeLessThanOrEqual(SCROLL_TOLERANCE)
    })

    test("RF-LAY-14, NF-IN-10: na não encontrada a troca leva à URL equivalente", async ({
        page
    }) => {
        await page.goto("pt-BR/rota-inexistente")
        await page.getByRole("heading", { level: 1, name: "Página não encontrada" }).waitFor()

        await chooseLanguage(page, "pt-BR", "en")

        await expect(page).toHaveURL(/\/en\/rota-inexistente$/)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found")
        await expect(page.locator("html")).toHaveAttribute("lang", "en")
    })

    test("RF-LAY-12: Esc fecha a lista devolvendo o foco ao botão e o clique fora também fecha", async ({
        page
    }) => {
        await openHome(page, "pt-BR")
        const button = await openLanguageList(page, "pt-BR")

        await page.keyboard.press("Escape")
        await expect(button).toHaveAttribute("aria-expanded", "false")
        await expect(button).toBeFocused()

        await button.click()
        await expect(button).toHaveAttribute("aria-expanded", "true")
        await clickOutsideSelector(page)
        await expect(button).toHaveAttribute("aria-expanded", "false")
    })

    test("RF-LAY-14: a troca grava a escolha em portfolio-frontend:language", async ({ page }) => {
        await openHome(page, "pt-BR")
        expect(await page.evaluate((key) => localStorage.getItem(key), LANGUAGE_STORAGE_KEY)).toBe(
            null
        )

        await chooseLanguage(page, "pt-BR", "en")
        await expectHomeIn(page, "en")

        expect(await page.evaluate((key) => localStorage.getItem(key), LANGUAGE_STORAGE_KEY)).toBe(
            "en"
        )
    })
})

const BROWSER_LOCALES = [
    { locale: "fr-FR", expected: "en" },
    { locale: "pt-BR", expected: "pt-BR" },
    { locale: "es-ES", expected: "es" },
    { locale: "en-US", expected: "en" }
]

test.describe("raiz e caminho sem prefixo", () => {
    for (const { locale, expected } of BROWSER_LOCALES) {
        test.describe(`navegador em ${locale}`, () => {
            test.use({ locale })

            test(`NF-IN-09, RF-LAY-11: sem escolha salva a raiz termina em ${expected}`, async ({
                page
            }) => {
                await page.goto("")

                await expect(page).toHaveURL(new RegExp(`/${expected}$`))
                await expect(page.locator("html")).toHaveAttribute("lang", expected)
            })
        })
    }

    test.describe("com escolha salva", () => {
        test.use({ locale: "pt-BR" })

        test("NF-IN-09: a escolha salva vale mais que o idioma do navegador", async ({ page }) => {
            await page.addInitScript((key) => localStorage.setItem(key, "es"), LANGUAGE_STORAGE_KEY)

            await page.goto("")

            await expect(page).toHaveURL(/\/es$/)
            await expect(page.locator("html")).toHaveAttribute("lang", "es")
        })
    })

    test("NF-IN-09: o redirecionamento preserva query e hash", async ({ page }) => {
        await page.goto("?a=1#x")

        await expect(page).toHaveURL(/\/en\?a=1#x$/)
    })

    test("NF-IN-06, RF-LAY-28: o caminho sem prefixo mostra a não encontrada em inglês", async ({
        page
    }) => {
        await page.goto("projects")

        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found")
        await expect(page.locator("html")).toHaveAttribute("lang", "en")
    })

    test("NF-IN-08, RF-LAY-11: ?lng=es em pt-BR é ignorado", async ({ page }) => {
        await page.goto("pt-BR?lng=es")
        await page.getByRole("heading", { level: 1 }).waitFor()

        await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR")
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(LANGUAGES["pt-BR"].heading)
    })
})
