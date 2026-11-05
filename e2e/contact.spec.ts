import { expect, test } from "@playwright/test"
import type { Locator, Page } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import chooseLanguageInHeader from "./support/chooseLanguageInHeader"
import collectConsoleProblems from "./support/collectConsoleProblems"
import holdContent from "./support/holdContent"
import readContactChannels from "./support/readContactChannels"
import UI_TEXTS from "./support/uiTexts"
import waitForHydration from "./support/waitForHydration"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const DESKTOP_MIN_WIDTH = 640
const TARGET_SIZE = 44
const NARROW_VIEWPORT = { width: 320, height: 700 }
const RESET_TIMEOUT = 8000

type Language = (typeof LANGUAGES)[number]

function isDesktop(page: Page) {
    return (page.viewportSize()?.width ?? 0) >= DESKTOP_MIN_WIDTH
}

async function openContact(page: Page, language: Language = "pt-BR") {
    await page.goto(`${language}/contact`)
    await page.getByRole("heading", { level: 1 }).waitFor()
}

async function openMenuIfCollapsed(page: Page, language: Language) {
    if (isDesktop(page)) {
        return
    }

    const menu = page.getByRole("button", { name: UI_TEXTS[language].menu })
    if ((await menu.getAttribute("aria-expanded")) !== "true") {
        await menu.click()
    }
}

async function getContactNavLink(page: Page, language: Language) {
    await openMenuIfCollapsed(page, language)
    return page
        .getByRole("navigation", { name: UI_TEXTS[language].navigationLabel })
        .getByRole("link", { name: UI_TEXTS[language].navigation.contact, exact: true })
}

async function openContactFromNotFound(page: Page) {
    await page.goto("pt-BR/rota-inexistente")
    await page.getByRole("heading", { level: 1, name: UI_TEXTS["pt-BR"].notFoundHeading }).waitFor()
    await waitForHydration(page)
    await (await getContactNavLink(page, "pt-BR")).click()
    await expect(page).toHaveURL(/\/pt-BR\/contact$/)
}

async function expectMinimumTarget(target: Locator) {
    const box = await target.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(TARGET_SIZE)
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(TARGET_SIZE)
}

test.describe("canais de contato", () => {
    for (const language of LANGUAGES) {
        const texts = UI_TEXTS[language].contact

        test(`RF-CONTACT-02, RF-CONTACT-03, RF-CONTACT-04, RF-CONTACT-05, RF-CONTACT-06, RF-CONTACT-25: em ${language} os três blocos trazem o e-mail, a localização e a resposta do conteúdo do idioma`, async ({
            page
        }) => {
            const channels = readContactChannels(language)
            await openContact(page, language)
            const main = page.getByRole("main")

            await expect(page.getByRole("heading", { level: 1 })).toHaveText(texts.heading)
            await expect(main).toContainText(texts.ledeDirect)
            for (const heading of [
                texts.emailHeading,
                texts.locationHeading,
                texts.responseHeading
            ]) {
                await expect(main.getByRole("heading", { level: 2, name: heading })).toBeVisible()
            }
            await expect(main.getByText(channels.email, { exact: true })).toBeVisible()
            await expect(main.getByText(channels.location, { exact: true })).toBeVisible()
            await expect(main.getByText(channels.locationDetail, { exact: true })).toBeVisible()
            await expect(main.getByText(channels.responseLabel, { exact: true })).toBeVisible()
            await expect(main.getByText(channels.responseDetail, { exact: true })).toBeVisible()
            await expect(main.getByText(channels.availabilityLabel, { exact: true })).toBeVisible()
        })

        test(`RF-CONTACT-04: em ${language} Enviar e-mail é um mailto com o e-mail do conteúdo e sem nova aba`, async ({
            page
        }) => {
            const channels = readContactChannels(language)
            await openContact(page, language)

            const link = page.getByRole("main").getByRole("link", { name: texts.sendEmail })

            await expect(link).toHaveAttribute("href", `mailto:${channels.email}`)
            await expect(link).not.toHaveAttribute("target", /.*/)
        })

        test(`RF-CONTACT-27, NF-IA-10, RF-CONTACT-26: em ${language} a tela tem título, description, canônica, quatro hreflang e JSON-LD ContactPage do idioma`, async ({
            page
        }) => {
            await openContact(page, language)

            await expect(page).toHaveTitle(texts.title)
            await expect(page.locator('meta[name="description"]')).toHaveAttribute(
                "content",
                texts.description
            )
            await expect(page.locator("html")).toHaveAttribute("lang", language)
            await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
                "href",
                new RegExp(`/${language}/contact$`)
            )
            await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(4)
            const jsonLd = await page.locator('script[type="application/ld+json"]').innerText()
            expect(JSON.parse(jsonLd)["@type"]).toBe("ContactPage")
        })
    }

    test("RF-CONTACT-04, A11Y-CT01: Copiar e-mail copia o e-mail do conteúdo e anuncia E-mail copiado no status", async ({
        page,
        context
    }) => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"])
        const texts = UI_TEXTS["pt-BR"].contact
        const channels = readContactChannels("pt-BR")
        await openContact(page)
        await waitForHydration(page)
        const main = page.getByRole("main")
        const status = main.getByRole("status")
        const copy = status.locator("xpath=..").getByRole("button")

        await expect(status).toHaveText("")
        await copy.click()

        await expect(status).toHaveText(texts.emailCopied)
        await expect(copy).toHaveText(texts.emailCopied)
        expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(channels.email)
        await expect(main.getByRole("button", { name: texts.copyEmail })).toBeVisible({
            timeout: RESET_TIMEOUT
        })
        await expect(status).toHaveText("")
    })

    test("RF-CONTACT-04, A11Y-CT01: com a cópia rejeitada o status anuncia Não foi possível copiar", async ({
        page
    }) => {
        const texts = UI_TEXTS["pt-BR"].contact
        await page.addInitScript(() => {
            navigator.clipboard.writeText = () => Promise.reject(new Error("bloqueado"))
        })
        await openContact(page)
        await waitForHydration(page)
        const main = page.getByRole("main")

        await main.getByRole("button", { name: texts.copyEmail }).click()

        await expect(main.getByRole("status")).toHaveText(texts.copyFailed)
    })

    test("RF-CONTACT-08: Baixar CV é um link para o PDF do idioma com o nome acessível de pré-visualização", async ({
        page
    }) => {
        for (const language of LANGUAGES) {
            const texts = UI_TEXTS[language].contact
            await openContact(page, language)
            const main = page.getByRole("main")

            const resume = main.getByRole("link", { name: texts.resumeName })
            await expect(resume).toContainText(texts.resumeButton)
            await expect(resume).toHaveAttribute("href", `${FATEC_BASE_PATH}cv/cv-${language}.pdf`)
            await expect(resume).not.toHaveAttribute("download", /.*/)
            await expect(resume).not.toHaveAttribute("target", /.*/)
        }
    })

    test("RF-CONTACT-09: não há agendar conversa, lista de redes nem procurando vaga fixa", async ({
        page
    }) => {
        await openContact(page)
        const main = page.getByRole("main")

        await expect(main.getByRole("link", { name: /agendar/i })).toHaveCount(0)
        await expect(main.getByText(/procurando vaga fixa/i)).toHaveCount(0)
        await expect(main.getByRole("link", { name: /github|linkedin/i })).toHaveCount(0)
    })

    test("RF-CONTACT-04: Enviar e-mail e Copiar e-mail têm alvo de pelo menos 44px", async ({
        page
    }) => {
        const texts = UI_TEXTS["pt-BR"].contact
        await openContact(page)
        const main = page.getByRole("main")

        await expectMinimumTarget(main.getByRole("button", { name: texts.copyEmail }))
        await expectMinimumTarget(main.getByRole("link", { name: texts.sendEmail }))
        await expectMinimumTarget(main.getByRole("link", { name: texts.resumeName }))
    })

    test("RF-CONTACT-07, NF-TE-04: localização e resposta ficam lado a lado no desktop e nada estoura a largura de 320px", async ({
        page
    }) => {
        const texts = UI_TEXTS["pt-BR"].contact
        await openContact(page)
        const main = page.getByRole("main")

        if (isDesktop(page)) {
            const location = await main
                .getByRole("heading", { level: 2, name: texts.locationHeading })
                .boundingBox()
            const response = await main
                .getByRole("heading", { level: 2, name: texts.responseHeading })
                .boundingBox()
            expect(Math.abs((location?.y ?? 0) - (response?.y ?? 1))).toBeLessThan(2)
            expect(response?.x ?? 0).toBeGreaterThan(location?.x ?? 0)
        }

        await page.setViewportSize(NARROW_VIEWPORT)
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        )
        expect(overflow).toBeLessThanOrEqual(0)
        await expect(
            main.getByText(readContactChannels("pt-BR").email, { exact: true })
        ).toBeVisible()
    })

    test("RF-CONTACT-11, RF-CONTACT-12: sem a flag o bloco fica centralizado em uma coluna única", async ({
        page
    }) => {
        test.skip(
            !isDesktop(page),
            "a centralização só é distinguível quando o bloco é mais estreito que a tela"
        )
        await openContact(page)
        const container = page.getByRole("heading", { level: 1 }).locator("xpath=../..")

        const box = await container.boundingBox()
        const viewportWidth = page.viewportSize()?.width ?? 0
        const left = box?.x ?? 0
        const right = viewportWidth - left - (box?.width ?? 0)

        expect(box?.width ?? viewportWidth).toBeLessThan(viewportWidth - 2 * 40)
        expect(Math.abs(left - right)).toBeLessThanOrEqual(2)
    })
})

test.describe("ausência do formulário", () => {
    test("RF-CONTACT-11, NF-DA-06: com a flag desligada não há formulário, campo nem nota de privacidade e o chunk do formulário não é baixado", async ({
        page
    }) => {
        const requested: string[] = []
        page.on("request", (request) => requested.push(request.url()))
        const texts = UI_TEXTS["pt-BR"].contact

        await openContact(page)
        await waitForHydration(page)

        await expect(page.locator("form")).toHaveCount(0)
        await expect(page.getByRole("region", { name: texts.formLabel })).toHaveCount(0)
        await expect(page.getByRole("textbox")).toHaveCount(0)
        await expect(page.getByRole("radio")).toHaveCount(0)
        await expect(page.getByText(texts.privacyNote)).toHaveCount(0)
        await expect(page.getByText(texts.ledeForm)).toHaveCount(0)
        expect(requested.filter((url) => /ContactForm/.test(url))).toEqual([])
    })

    test("NF-DA-01, NF-PR-01: a tela só faz requisições à própria origem", async ({ page }) => {
        const origins = new Set<string>()
        page.on("request", (request) => origins.add(new URL(request.url()).origin))

        await openContact(page)
        await waitForHydration(page)

        expect([...origins]).toEqual([new URL(page.url()).origin])
    })

    for (const language of LANGUAGES) {
        test(`NF-IN-11, RF-CONTACT-26: em ${language} a tela hidrata sem erro nem aviso no console`, async ({
            page
        }) => {
            const problems = collectConsoleProblems(page)

            await openContact(page, language)
            await waitForHydration(page)
            await expect(
                page.getByRole("main").getByRole("button", {
                    name: UI_TEXTS[language].contact.copyEmail
                })
            ).toBeVisible()

            expect(problems).toEqual([])
        })
    }
})

test.describe("navegação e foco", () => {
    for (const language of LANGUAGES) {
        test(`RF-CONTACT-27, RF-LAY-04, NF-IN-11: em ${language} o item Contato do cabeçalho leva a /contact do idioma, foca o h1 e fica com aria-current`, async ({
            page
        }) => {
            await page.goto(language)
            await page.getByRole("heading", { level: 1 }).waitFor()
            await waitForHydration(page)

            const link = await getContactNavLink(page, language)
            await expect(link).toHaveAttribute("href", `${FATEC_BASE_PATH}${language}/contact`)
            await link.click()

            await expect(page).toHaveURL(new RegExp(`/${language}/contact$`))
            await expect(page.getByRole("heading", { level: 1 })).toHaveText(
                UI_TEXTS[language].contact.heading
            )
            await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
            await expect(page).toHaveTitle(UI_TEXTS[language].contact.title)
            await expect(await getContactNavLink(page, language)).toHaveAttribute(
                "aria-current",
                "page"
            )
        })

        test(`RF-LAY-26, NF-IN-11: em ${language} o rodapé de navegação leva a Início, Projetos e Informações do idioma e não repete o contato`, async ({
            page
        }) => {
            const texts = UI_TEXTS[language]
            await openContact(page, language)
            const footer = page.getByRole("contentinfo")

            const expected = [
                { name: texts.navigation.home, href: `${FATEC_BASE_PATH}${language}` },
                { name: texts.navigation.projects, href: `${FATEC_BASE_PATH}${language}/projects` },
                { name: texts.navigation.about, href: `${FATEC_BASE_PATH}${language}/about` }
            ]
            for (const { name, href } of expected) {
                await expect(
                    footer.getByRole("navigation").getByRole("link", { name, exact: true })
                ).toHaveAttribute("href", href)
            }
            await expect(footer.getByRole("link", { name: texts.contactCta })).toHaveCount(0)
            await expect(footer.getByRole("button", { name: texts.contact.copyEmail })).toHaveCount(
                0
            )
        })
    }

    test("RF-LAY-26, RF-LAY-15: o link Projetos do rodapé de navegação leva à lista no idioma da tela", async ({
        page
    }) => {
        await openContact(page, "en")
        await waitForHydration(page)

        await page
            .getByRole("contentinfo")
            .getByRole("navigation")
            .getByRole("link", { name: UI_TEXTS.en.navigation.projects, exact: true })
            .click()

        await expect(page).toHaveURL(/\/en\/projects$/)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            UI_TEXTS.en.projects.heading
        )
    })

    test("NF-IN-11, RF-CONTACT-27: trocar o idioma na tela de contato leva à mesma tela no idioma escolhido", async ({
        page
    }) => {
        await openContact(page, "pt-BR")
        await waitForHydration(page)

        await chooseLanguageInHeader(page, "pt-BR", "es")

        await expect(page).toHaveURL(/\/es\/contact$/)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            UI_TEXTS.es.contact.heading
        )
        await expect(page.locator("html")).toHaveAttribute("lang", "es")
        await expect(page).toHaveTitle(UI_TEXTS.es.contact.title)
    })
})

test.describe("carregando e erro dos canais", () => {
    test("A11Y-G13, RF-CONTACT-01, RF-CONTACT-02: enquanto o perfil carrega há título, abertura e status Carregando sem selo nem e-mail e, ao chegar, os canais aparecem", async ({
        page
    }) => {
        const texts = UI_TEXTS["pt-BR"]
        const channels = readContactChannels("pt-BR")
        const release = await holdContent(page, "pt-BR", "profile")

        await openContactFromNotFound(page)
        const main = page.getByRole("main")

        await expect(page.getByRole("heading", { level: 1 })).toHaveText(texts.contact.heading)
        await expect(main).toContainText(texts.contact.ledeDirect)
        await expect(main.getByRole("status")).toContainText(texts.loading)
        await expect(main.getByText(channels.email, { exact: true })).toHaveCount(0)
        await expect(main.getByText(channels.availabilityLabel)).toHaveCount(0)

        release()

        await expect(main.getByText(channels.email, { exact: true })).toBeVisible()
        await expect(main.getByText(channels.availabilityLabel, { exact: true })).toBeVisible()
        await expect(main.getByText(texts.loading)).toHaveCount(0)
    })

    test("A11Y-G14, RF-CONTACT-25: com o perfil falhando aparece o alerta com Tentar novamente e o retry refaz a consulta sem recarregar e devolve o foco ao título", async ({
        page
    }) => {
        const texts = UI_TEXTS["pt-BR"].contact
        const channels = readContactChannels("pt-BR")
        await page.route("**/content/pt-BR/profile.json", (route) => route.abort())

        await openContactFromNotFound(page)
        const main = page.getByRole("main")
        const alert = main.getByRole("alert").filter({ hasText: texts.loadError })

        await expect(alert).toBeVisible()
        await expect(alert.getByRole("button", { name: texts.retry })).toBeVisible()
        await expect(main.getByText(channels.email, { exact: true })).toHaveCount(0)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            UI_TEXTS["pt-BR"].contact.heading
        )
        await page.evaluate(() => Reflect.set(window, "e2eMarker", true))
        await page.unroute("**/content/pt-BR/profile.json")

        await alert.getByRole("button", { name: texts.retry }).click()

        await expect(main.getByText(channels.email, { exact: true })).toBeVisible()
        await expect(alert).toHaveCount(0)
        await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
        expect(await page.evaluate(() => Reflect.get(window, "e2eMarker"))).toBe(true)
    })

    test("A11Y-G14: se o retry falhar de novo o alerta e o botão Tentar novamente continuam na tela e o foco fica no alerta", async ({
        page
    }) => {
        const texts = UI_TEXTS["pt-BR"].contact
        let attempts = 0
        await page.route("**/content/pt-BR/profile.json", (route) => {
            attempts += 1
            return route.abort()
        })

        await openContactFromNotFound(page)
        const alert = page.getByRole("main").getByRole("alert").filter({ hasText: texts.loadError })
        await expect(alert).toBeVisible()
        const attemptsBeforeRetry = attempts

        await alert.getByRole("button", { name: texts.retry }).click()

        await expect.poll(() => attempts).toBeGreaterThan(attemptsBeforeRetry)
        await expect(alert.getByRole("button", { name: texts.retry })).toBeVisible()
        await expect(page.locator("#contact-alert")).toBeFocused()
    })
})

test.describe("sem JavaScript", () => {
    test.use({ javaScriptEnabled: false })

    for (const language of LANGUAGES) {
        const texts = UI_TEXTS[language].contact

        test(`NF-CO-03, NF-IA-01, RF-CONTACT-11, RF-CONTACT-04, RF-CONTACT-08: em ${language} o HTML traz título, canais, mailto e CV desabilitado e nenhum formulário`, async ({
            page
        }) => {
            const channels = readContactChannels(language)

            const response = await page.goto(`${language}/contact`)

            expect(response?.status()).toBe(200)
            await expect(page.locator("html")).toHaveAttribute("lang", language)
            await expect(page).toHaveTitle(texts.title)
            await expect(page.locator('meta[name="description"]')).toHaveAttribute(
                "content",
                texts.description
            )
            const main = page.getByRole("main")
            await expect(main.getByRole("heading", { level: 1 })).toHaveText(texts.heading)
            await expect(main).toContainText(texts.ledeDirect)
            await expect(main.getByText(channels.email, { exact: true })).toBeVisible()
            await expect(main.getByText(channels.location, { exact: true })).toBeVisible()
            await expect(main.getByText(channels.responseLabel, { exact: true })).toBeVisible()
            await expect(main.getByText(channels.availabilityLabel, { exact: true })).toBeVisible()
            await expect(main.getByRole("link", { name: texts.sendEmail })).toHaveAttribute(
                "href",
                `mailto:${channels.email}`
            )
            await expect(main.getByRole("link", { name: texts.resumeName })).toHaveAttribute(
                "href",
                `${FATEC_BASE_PATH}cv/cv-${language}.pdf`
            )
            await expect(page.locator("form")).toHaveCount(0)
            await expect(page.getByRole("textbox")).toHaveCount(0)
        })
    }
})
