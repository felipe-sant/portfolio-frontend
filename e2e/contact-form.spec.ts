import { expect, test } from "@playwright/test"
import type { Locator, Page } from "@playwright/test"
import expectNoAxeViolations from "./support/expectNoAxeViolations"
import failContactSend from "./support/failContactSend"
import holdContactSend from "./support/holdContactSend"
import measureBorderContrast from "./support/measureBorderContrast"
import UI_TEXTS from "./support/uiTexts"
import waitForHydration from "./support/waitForHydration"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const TWO_COLUMNS_MIN_WIDTH = 900
const MESSAGE_MAX_LENGTH = 600
const NARROW_VIEWPORT = { width: 320, height: 700 }
const MINIMUM_BORDER_CONTRAST = 3
const MINIMUM_TARGET = 44
const VALID = {
    name: "Maria Souza",
    email: "maria@example.com",
    message: "Preciso de um site para a minha loja, com prazo de dois meses."
}

type Language = (typeof LANGUAGES)[number]

function getForm(page: Page, language: Language) {
    const texts = UI_TEXTS[language].contact
    const region = page.getByRole("region", { name: texts.formLabel })

    return {
        texts,
        region,
        name: region.getByRole("textbox", { name: texts.nameLabel, exact: true }),
        email: region.getByRole("textbox", { name: texts.emailLabel, exact: true }),
        message: region.getByRole("textbox", { name: texts.messageLabel, exact: true }),
        submit: region.getByRole("button", { name: texts.submit }),
        summary: region.getByRole("alert"),
        sentHeading: region.getByRole("heading", { level: 2, name: texts.sentHeading }),
        sentAgain: region.getByRole("button", { name: texts.sentAgain }),
        radio: (subject: keyof typeof texts.subjects) =>
            region.getByRole("radio", { name: texts.subjects[subject] })
    }
}

async function openForm(page: Page, language: Language = "pt-BR") {
    await page.goto(`${language}/contact`)
    await page.getByRole("heading", { level: 1 }).waitFor()
    await waitForHydration(page)
    const form = getForm(page, language)
    await expect(form.region).toBeVisible()
    await page.waitForLoadState("networkidle")
    return form
}

async function fillValid(form: ReturnType<typeof getForm>) {
    await form.name.fill(VALID.name)
    await form.email.fill(VALID.email)
    await form.message.fill(VALID.message)
}

async function expectNoHorizontalScroll(page: Page) {
    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
    expect(overflow).toBeLessThanOrEqual(0)
}

async function hasTopBorderAncestor(target: Locator) {
    return target.evaluate((element) => {
        let current: HTMLElement | null = element.parentElement
        while (current && current.tagName !== "MAIN") {
            if (parseFloat(getComputedStyle(current).borderTopWidth) > 0) {
                return true
            }
            current = current.parentElement
        }
        return false
    })
}

test.describe("formulário, estrutura", () => {
    for (const language of LANGUAGES) {
        test(`RF-CONTACT-02, RF-CONTACT-13, RF-CONTACT-14, A11Y-G15: em ${language} a abertura, a seção, a frase, os campos, o assunto e a nota aparecem na ordem do idioma`, async ({
            page
        }) => {
            const form = await openForm(page, language)
            const texts = form.texts

            await expect(page.getByRole("main")).toContainText(texts.ledeForm)
            await expect(page.getByRole("main")).not.toContainText(texts.ledeDirect)
            await expect(form.region).toContainText(texts.requiredNote)
            await expect(form.region).toContainText(texts.privacyNote)
            await expect(form.name).toBeVisible()
            await expect(form.email).toBeVisible()
            await expect(form.message).toHaveAttribute("placeholder", texts.messagePlaceholder)
            const group = form.region.getByRole("group", { name: texts.subjectLegend })
            await expect(group.getByRole("radio")).toHaveCount(4)
            for (const label of Object.values(texts.subjects)) {
                await expect(group.getByRole("radio", { name: label })).toBeVisible()
            }
            await expect(form.submit).toBeVisible()
            const order = await form.region.evaluate((section) =>
                [...section.querySelectorAll("p, input, textarea, fieldset, button")].map(
                    (element) => element.tagName.toLowerCase()
                )
            )
            expect(order).toEqual([
                "p",
                "input",
                "input",
                "fieldset",
                ...Array(4).fill("input"),
                "textarea",
                "button",
                "p"
            ])
        })
    }

    test("RF-CONTACT-13, RF-CONTACT-15, A11Y-CT02: os campos têm rótulo, autocomplete, obrigatório, limite e a mensagem tem 6 linhas", async ({
        page
    }) => {
        const form = await openForm(page)

        await expect(form.name).toHaveAttribute("autocomplete", "name")
        await expect(form.name).toHaveAttribute("maxlength", "100")
        await expect(form.name).toHaveAttribute("aria-required", "true")
        await expect(form.email).toHaveAttribute("type", "email")
        await expect(form.email).toHaveAttribute("inputmode", "email")
        await expect(form.email).toHaveAttribute("autocomplete", "email")
        await expect(form.email).toHaveAttribute("maxlength", "254")
        await expect(form.email).toHaveAttribute("aria-required", "true")
        await expect(form.message).toHaveAttribute("rows", "6")
        await expect(form.message).toHaveAttribute("maxlength", String(MESSAGE_MAX_LENGTH))
        await expect(form.message).toHaveAttribute("aria-required", "true")
        await expect(page.locator("form#contact-form")).toHaveAttribute("novalidate", "")
        await expect(form.region.getByRole("radio")).toHaveCount(4)
        await expect(form.region.locator("input[aria-pressed]")).toHaveCount(0)
    })

    test("RF-CONTACT-23: só os rádios do assunto têm name e os campos de texto não", async ({
        page
    }) => {
        const form = await openForm(page)

        const named = await form.region.evaluate((section) =>
            [...section.querySelectorAll("[name]")].map(
                (element) => `${element.tagName.toLowerCase()}:${element.getAttribute("name")}`
            )
        )

        expect(named).toEqual(Array(4).fill("input:subject"))
    })

    test("RF-CONTACT-14: Projeto novo já vem marcado e as setas trocam o assunto movendo o foco", async ({
        page
    }) => {
        const form = await openForm(page)

        await expect(form.radio("newProject")).toBeChecked()
        await form.radio("newProject").focus()
        await page.keyboard.press("ArrowRight")

        await expect(form.radio("freelance")).toBeChecked()
        await expect(form.radio("freelance")).toBeFocused()
        await expect(form.radio("newProject")).not.toBeChecked()
        await page.keyboard.press("ArrowRight")
        await expect(form.radio("job")).toBeChecked()
        await page.keyboard.press("ArrowLeft")
        await expect(form.radio("freelance")).toBeChecked()
    })

    test("RF-CONTACT-14, RF-CONTACT-13: a ordem do Tab é Nome, E-mail, assunto, Mensagem e Enviar mensagem, com um só ponto de parada no assunto", async ({
        page
    }) => {
        const form = await openForm(page)

        await form.name.focus()
        await page.keyboard.press("Tab")
        await expect(form.email).toBeFocused()
        await page.keyboard.press("Tab")
        await expect(form.radio("newProject")).toBeFocused()
        await page.keyboard.press("Tab")
        await expect(form.message).toBeFocused()
        await page.keyboard.press("Tab")
        await expect(form.submit).toBeFocused()
    })

    test("RF-CONTACT-12: a partir de 900px o formulário fica à esquerda e os canais à direita; abaixo, os canais vêm depois com borda superior", async ({
        page
    }) => {
        const form = await openForm(page)
        const heading = page
            .getByRole("main")
            .getByRole("heading", { level: 2, name: form.texts.emailHeading })
        const formBox = await form.region.boundingBox()
        const channelsBox = await heading.boundingBox()
        const isWide = (page.viewportSize()?.width ?? 0) >= TWO_COLUMNS_MIN_WIDTH

        if (isWide) {
            expect(channelsBox?.x ?? 0).toBeGreaterThanOrEqual(
                (formBox?.x ?? 0) + (formBox?.width ?? 0)
            )
            expect(await hasTopBorderAncestor(heading)).toBe(false)
        } else {
            expect(channelsBox?.y ?? 0).toBeGreaterThanOrEqual(
                (formBox?.y ?? 0) + (formBox?.height ?? 0)
            )
            expect(await hasTopBorderAncestor(heading)).toBe(true)
        }
    })

    test("RF-CONTACT-13, A11Y-CT08: Enviar mensagem, os campos e os chips do assunto têm 44px de alvo e a borda do campo tem contraste 3:1", async ({
        page
    }) => {
        const form = await openForm(page)

        for (const target of [form.name, form.email, form.submit, form.radio("newProject")]) {
            const box = await target.boundingBox()
            expect(box?.height ?? 0).toBeGreaterThanOrEqual(MINIMUM_TARGET)
        }
        const chip = await form.radio("newProject").locator("xpath=..").boundingBox()
        expect(chip?.height ?? 0).toBeGreaterThanOrEqual(MINIMUM_TARGET)
        for (const field of [form.name, form.email, form.message]) {
            expect(await measureBorderContrast(field)).toBeGreaterThanOrEqual(
                MINIMUM_BORDER_CONTRAST
            )
        }
    })
})

test.describe("formulário, contador", () => {
    test("RF-CONTACT-15, A11Y-CT05: o contador mostra os restantes ligado ao campo e o anúncio só ocorre ao cruzar 60 e ao chegar a 0", async ({
        page
    }) => {
        const form = await openForm(page)
        const texts = form.texts
        const live = form.region.locator('[aria-live="polite"]')
        const counter = form.region.getByText(texts.remaining(MESSAGE_MAX_LENGTH), { exact: true })

        await expect(counter).toBeVisible()
        await expect(counter).not.toHaveAttribute("aria-live", /.*/)
        await expect(form.message).toHaveAccessibleDescription(texts.remaining(MESSAGE_MAX_LENGTH))
        await expect(live).toHaveCount(1)

        await form.message.fill("a".repeat(500))
        await expect(form.region.getByText(texts.remaining(100), { exact: true })).toBeVisible()
        await expect(live).toHaveText("")

        await form.message.fill("a".repeat(541))
        await expect(live).toHaveText(texts.nearLimit(59))
        await expect(form.region.getByText(texts.remaining(59), { exact: true })).toBeVisible()

        await form.message.fill("a".repeat(590))
        await expect(form.region.getByText(texts.remaining(10), { exact: true })).toBeVisible()
        await expect(live).toHaveText(texts.nearLimit(59))

        await form.message.fill("a".repeat(MESSAGE_MAX_LENGTH))
        await expect(live).toHaveText(texts.limitReached(MESSAGE_MAX_LENGTH))
        await expect(form.region.getByText(texts.remaining(0), { exact: true })).toBeVisible()
    })

    test("RF-CONTACT-15: com 600 caracteres a mensagem para de aceitar texto", async ({ page }) => {
        const form = await openForm(page)

        await form.message.fill("a".repeat(MESSAGE_MAX_LENGTH))
        await form.message.focus()
        await page.keyboard.type("bbb")

        await expect(form.message).toHaveValue("a".repeat(MESSAGE_MAX_LENGTH))
    })
})

test.describe("formulário, validação", () => {
    for (const language of LANGUAGES) {
        test(`RF-CONTACT-16, RF-CONTACT-17, RF-CONTACT-18, A11Y-CT03, A11Y-CT04, A11Y-G15: em ${language} o envio vazio mostra o resumo, três mensagens ligadas aos campos e o foco no Nome`, async ({
            page
        }) => {
            const form = await openForm(page, language)
            const texts = form.texts

            await form.submit.click()

            await expect(form.summary).toHaveCount(1)
            await expect(form.summary).toHaveText(texts.errorSummary(3))
            await expect(form.name).toBeFocused()
            const expected = [
                { field: form.name, message: texts.nameRequired },
                { field: form.email, message: texts.emailRequired },
                { field: form.message, message: texts.messageTooShort }
            ]
            for (const { field, message } of expected) {
                await expect(field).toHaveAttribute("aria-invalid", "true")
                await expect(field).toHaveAccessibleDescription(
                    new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
                )
                await expect(form.region.getByText(message, { exact: true })).toBeVisible()
            }
            await expect(form.radio("newProject")).not.toHaveAttribute("aria-invalid", /.*/)
        })
    }

    test("RF-CONTACT-16: nada é validado enquanto a pessoa digita antes do primeiro envio", async ({
        page
    }) => {
        const form = await openForm(page)

        await form.email.fill("abc")
        await form.name.focus()
        await form.message.fill("curta")
        await form.submit.focus()

        await expect(form.email).not.toHaveAttribute("aria-invalid", /.*/)
        await expect(form.message).not.toHaveAttribute("aria-invalid", /.*/)
        await expect(form.summary).toHaveCount(0)
    })

    test("RF-CONTACT-18, A11Y-CT03: o foco vai ao primeiro campo inválido na ordem Nome, E-mail, Mensagem", async ({
        page
    }) => {
        const form = await openForm(page)

        await form.name.fill(VALID.name)
        await form.submit.click()
        await expect(form.email).toBeFocused()
        await expect(form.summary).toHaveText(form.texts.errorSummary(2))

        await form.email.fill(VALID.email)
        await form.submit.click()
        await expect(form.message).toBeFocused()
        await expect(form.summary).toHaveText(form.texts.errorSummary(1))
    })

    test("RF-CONTACT-16: e-mail sem formato mostra a mensagem de formato e, vazio, só a de obrigatório", async ({
        page
    }) => {
        const form = await openForm(page)
        const texts = form.texts

        await form.name.fill(VALID.name)
        await form.email.fill("maria@exemplo")
        await form.message.fill(VALID.message)
        await form.submit.click()

        await expect(form.email).toBeFocused()
        await expect(form.region.getByText(texts.emailInvalid, { exact: true })).toBeVisible()
        await expect(form.region.getByText(texts.emailRequired, { exact: true })).toHaveCount(0)
        await expect(form.summary).toHaveText(texts.errorSummary(1))
    })

    test("RF-CONTACT-16, RF-CONTACT-18: depois do primeiro erro cada campo é revalidado ao digitar, a contagem do resumo fica e o resumo some quando não sobra erro", async ({
        page
    }) => {
        const form = await openForm(page)
        const texts = form.texts

        await form.submit.click()
        await expect(form.summary).toHaveText(texts.errorSummary(3))

        await form.name.fill(VALID.name)
        await expect(form.name).not.toHaveAttribute("aria-invalid", /.*/)
        await expect(form.region.getByText(texts.nameRequired, { exact: true })).toHaveCount(0)
        await expect(form.summary).toHaveText(texts.errorSummary(3))

        await form.email.fill("x")
        await expect(form.region.getByText(texts.emailInvalid, { exact: true })).toBeVisible()
        await expect(form.region.getByText(texts.emailRequired, { exact: true })).toHaveCount(0)

        await form.email.fill(VALID.email)
        await form.message.fill(VALID.message)

        await expect(form.summary).toHaveCount(0)
        await expect(form.region.locator('[aria-invalid="true"]')).toHaveCount(0)
    })
})

test.describe("formulário, envio", () => {
    test("RF-CONTACT-19, A11Y-CT06: enquanto envia o botão fica com aria-busy, aria-disabled e Enviando, os campos e rádios ficam desabilitados e o spinner é aria-hidden", async ({
        page
    }) => {
        const release = await holdContactSend(page)
        const form = await openForm(page)
        await fillValid(form)

        await form.submit.click()

        const busy = form.region.getByRole("button", { name: form.texts.sending })
        await expect(busy).toHaveAttribute("aria-busy", "true")
        await expect(busy).toHaveAttribute("aria-disabled", "true")
        await expect(busy).not.toHaveAttribute("disabled", /.*/)
        await expect(busy.locator('[aria-hidden="true"]')).not.toHaveCount(0)
        for (const field of [form.name, form.email, form.message]) {
            await expect(field).toBeDisabled()
        }
        for (const subject of ["newProject", "freelance", "job", "other"] as const) {
            await expect(form.radio(subject)).toBeDisabled()
        }
        await expect(form.sentHeading).toHaveCount(0)

        await release()

        await expect(form.sentHeading).toBeVisible()
    })

    test("RF-CONTACT-19: um segundo clique enquanto envia é ignorado e só uma confirmação aparece", async ({
        page
    }) => {
        const release = await holdContactSend(page)
        const form = await openForm(page)
        await fillValid(form)

        await form.submit.click()
        const busy = form.region.getByRole("button", { name: form.texts.sending })
        await expect(busy).toHaveAttribute("aria-busy", "true")
        await busy.click({ force: true })
        await page.keyboard.press("Enter")
        await release()

        await expect(form.sentHeading).toHaveCount(1)
        await expect(form.name).toHaveCount(0)
    })

    test("RF-CONTACT-20, A11Y-CT07: o contêiner de status existe vazio desde o início e depois do envio mostra a confirmação com o foco no título", async ({
        page
    }) => {
        const form = await openForm(page)
        const status = form.region.getByRole("status")
        await expect(status).toHaveCount(1)
        await expect(status).toHaveText("")

        await fillValid(form)
        await form.submit.click()

        await expect(form.sentHeading).toBeFocused()
        await expect(status).toContainText(form.texts.sentHeading)
        await expect(status).toContainText(form.texts.sentDescription)
        await expect(form.sentAgain).toBeVisible()
        await expect(form.name).toHaveCount(0)
        await expect(form.submit).toHaveCount(0)
    })

    for (const language of LANGUAGES) {
        test(`RF-CONTACT-20, A11Y-G15: em ${language} a confirmação e o Enviar outra mensagem aparecem no idioma`, async ({
            page
        }) => {
            const form = await openForm(page, language)

            await form.name.fill(VALID.name)
            await form.email.fill(VALID.email)
            await form.message.fill(VALID.message)
            await form.submit.click()

            await expect(form.sentHeading).toBeFocused()
            await expect(form.region).toContainText(form.texts.sentDescription)
            await expect(form.sentAgain).toBeVisible()
        })
    }

    test("RF-CONTACT-20: Enviar outra mensagem volta ao formulário vazio, com Projeto novo, sem erros e com o foco no Nome", async ({
        page
    }) => {
        const form = await openForm(page)
        await fillValid(form)
        await form.radio("job").check()
        await form.submit.click()
        await expect(form.sentHeading).toBeFocused()

        await form.sentAgain.click()

        await expect(form.name).toBeFocused()
        await expect(form.name).toHaveValue("")
        await expect(form.email).toHaveValue("")
        await expect(form.message).toHaveValue("")
        await expect(form.radio("newProject")).toBeChecked()
        await expect(form.summary).toHaveCount(0)
        await expect(form.region.locator('[aria-invalid="true"]')).toHaveCount(0)
        await expect(form.region.getByText(form.texts.remaining(MESSAGE_MAX_LENGTH))).toBeVisible()
        await expect(form.sentHeading).toHaveCount(0)
    })

    test("RF-CONTACT-22, NF-DA-01, NF-PR-01: o envio não faz requisição de rede e não guarda o que foi digitado", async ({
        page
    }) => {
        const form = await openForm(page)
        const requests: string[] = []
        page.on("request", (request) => requests.push(`${request.method()} ${request.url()}`))
        await fillValid(form)

        await form.submit.click()
        await expect(form.sentHeading).toBeFocused()

        expect(requests).toEqual([])
        const stored = await page.evaluate(
            () => JSON.stringify(localStorage) + JSON.stringify(sessionStorage)
        )
        expect(stored).not.toContain(VALID.email)
        expect(stored).not.toContain(VALID.name)
        expect(stored).not.toContain(VALID.message)
        expect(new URL(page.url()).search).toBe("")
    })
})

test.describe("formulário, falha no envio", () => {
    for (const language of LANGUAGES) {
        test(`RF-CONTACT-21, A11Y-G15: em ${language} a falha mostra o banner de alerta com a mensagem do idioma, mantém os dados, reabilita os campos e devolve o foco ao botão`, async ({
            page
        }) => {
            await failContactSend(page)
            const form = await openForm(page, language)
            await fillValid(form)
            await form.radio("job").check()

            await form.submit.click()

            await expect(form.summary).toHaveCount(1)
            await expect(form.summary).toHaveText(form.texts.sendError)
            await expect(form.name).toHaveValue(VALID.name)
            await expect(form.email).toHaveValue(VALID.email)
            await expect(form.message).toHaveValue(VALID.message)
            await expect(form.radio("job")).toBeChecked()
            for (const field of [form.name, form.email, form.message]) {
                await expect(field).toBeEnabled()
            }
            await expect(form.submit).not.toHaveAttribute("aria-busy", "true")
            await expect(form.submit).toBeFocused()
            await expect(form.sentHeading).toHaveCount(0)
        })
    }

    test("RF-CONTACT-21: o banner some no próximo envio e, com o envio funcionando, a confirmação aparece", async ({
        page
    }) => {
        const recover = await failContactSend(page)
        const form = await openForm(page)
        await fillValid(form)
        await form.submit.click()
        await expect(form.summary).toHaveText(form.texts.sendError)

        await recover()
        await form.submit.click()

        await expect(form.sentHeading).toBeFocused()
        await expect(form.summary).toHaveCount(0)
    })

    test("RF-CONTACT-21: a falha repetida mantém um só banner", async ({ page }) => {
        await failContactSend(page)
        const form = await openForm(page)
        await fillValid(form)

        await form.submit.click()
        await expect(form.summary).toHaveText(form.texts.sendError)
        await form.submit.click()

        await expect(form.summary).toHaveCount(1)
        await expect(form.summary).toHaveText(form.texts.sendError)
    })

    test("A11Y-G03, RF-CONTACT-21: o axe não acusa violação no estado de falha", async ({
        page
    }) => {
        await failContactSend(page)
        const form = await openForm(page)
        await fillValid(form)
        await form.submit.click()
        await expect(form.summary).toBeVisible()

        await expectNoAxeViolations(page)
    })
})

test.describe("formulário, 320px", () => {
    test("NF-TE-04, RF-CONTACT-12: em 320px nenhum estado do formulário rola na horizontal", async ({
        page
    }) => {
        await page.setViewportSize(NARROW_VIEWPORT)
        const release = await holdContactSend(page)
        const form = await openForm(page)
        await expectNoHorizontalScroll(page)

        await form.submit.click()
        await expect(form.summary).toBeVisible()
        await expectNoHorizontalScroll(page)

        await fillValid(form)
        await form.message.fill("a".repeat(MESSAGE_MAX_LENGTH))
        await form.submit.click()
        await expect(form.region.getByRole("button", { name: form.texts.sending })).toBeVisible()
        await expectNoHorizontalScroll(page)

        await release()
        await expect(form.sentHeading).toBeVisible()
        await expectNoHorizontalScroll(page)
    })
})

test.describe("formulário, acessibilidade", () => {
    test("A11Y-G03, A11Y-CT08: o axe com contraste não acusa violação no estado normal", async ({
        page
    }) => {
        await openForm(page)

        await expectNoAxeViolations(page)
    })

    test("A11Y-G03, A11Y-CT04: o axe não acusa violação com os erros do envio vazio", async ({
        page
    }) => {
        const form = await openForm(page)
        await form.submit.click()
        await expect(form.summary).toBeVisible()

        await expectNoAxeViolations(page)
    })

    test("A11Y-G03, A11Y-CT05: o axe não acusa violação com o contador no limite", async ({
        page
    }) => {
        const form = await openForm(page)
        await form.message.fill("a".repeat(MESSAGE_MAX_LENGTH - 5))

        await expectNoAxeViolations(page)
    })

    test("A11Y-G03, A11Y-CT06: o axe não acusa violação enquanto envia", async ({ page }) => {
        const release = await holdContactSend(page)
        const form = await openForm(page)
        await fillValid(form)
        await form.submit.click()
        await expect(form.region.getByRole("button", { name: form.texts.sending })).toBeVisible()

        await expectNoAxeViolations(page)
        await release()
    })

    test("A11Y-G03, A11Y-CT07: o axe não acusa violação na confirmação de envio", async ({
        page
    }) => {
        const form = await openForm(page)
        await fillValid(form)
        await form.submit.click()
        await expect(form.sentHeading).toBeFocused()

        await expectNoAxeViolations(page)
    })

    for (const language of ["en", "es"] as const) {
        test(`A11Y-G03, A11Y-G15: em ${language} o axe não acusa violação no estado normal e com erros`, async ({
            page
        }) => {
            const form = await openForm(page, language)
            await expectNoAxeViolations(page)

            await form.submit.click()
            await expect(form.summary).toBeVisible()

            await expectNoAxeViolations(page)
        })
    }
})

test.describe("formulário, sem JavaScript", () => {
    test.use({ javaScriptEnabled: false })

    test("RF-CONTACT-23, NF-CO-03: o HTML pré-renderizado traz o formulário e enviar sem JavaScript não põe nome, e-mail nem mensagem na URL", async ({
        page
    }) => {
        const form = getForm(page, "pt-BR")

        const response = await page.goto("pt-BR/contact")

        expect(response?.status()).toBe(200)
        await expect(form.region).toBeVisible()
        await expect(page.getByRole("main")).toContainText(form.texts.ledeForm)
        await fillValid(form)
        await form.submit.click()

        await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
        const address = decodeURIComponent(page.url())
        expect(address).not.toContain(VALID.name)
        expect(address).not.toContain(VALID.email)
        expect(address).not.toContain(VALID.message)
    })
})
