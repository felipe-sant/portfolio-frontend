import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import collectConsoleProblems from "./support/collectConsoleProblems"
import expectNoAxeViolations from "./support/expectNoAxeViolations"
import chooseLanguageInHeader from "./support/chooseLanguageInHeader"
import navigateClientSide from "./support/navigateClientSide"
import openProject from "./support/openProject"
import PROJECT_TEXTS from "./support/projectTexts"
import projectPath from "./support/projectPath"
import readProjectDetail from "./support/readProjectDetail"
import waitForHydration from "./support/waitForHydration"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const MNIST = "MNIST Classifier"
const TOUCH_TARGET = 44
const HEADER_HEIGHT = 64
const MARKDOWN_CHUNK = /MarkdownDocument-[\w-]+\.js/
const PROBE = "pt-BR/rota-inexistente"
const POSITION_TOLERANCE = 3
const ANCHOR_MAX_GAP = 80

type Language = (typeof LANGUAGES)[number]

function documentsNav(page: Page, language: Language) {
    return page.getByRole("navigation", { name: PROJECT_TEXTS[language].documentsLabel })
}

function documentTitle(page: Page, name: string) {
    return page.getByRole("heading", { level: 2, name, exact: true })
}

async function activateDocument(page: Page, language: Language, name: string, title: string) {
    await waitForHydration(page)
    const link = documentsNav(page, language).getByRole("link", {
        name: PROJECT_TEXTS[language].documentLink(name, title)
    })
    await link.focus()
    await page.keyboard.press("Enter")
    await expect(documentTitle(page, name)).toBeFocused()
}

function isNarrow(page: Page) {
    return (page.viewportSize()?.width ?? 0) < 640
}

function documentBody(page: Page, name: string) {
    return documentTitle(page, name).locator("xpath=following-sibling::div[1]")
}

async function scrollToTitleOf(page: Page, name: string, offset: number) {
    const natural = await documentBody(page, name).evaluate(
        (element) => element.getBoundingClientRect().top + window.scrollY
    )
    await scrollTo(page, Math.round(natural - offset))
}

async function scrollPastNav(page: Page, language: Language, extra: number) {
    const natural = await documentsNav(page, language).evaluate(
        (element) => element.getBoundingClientRect().top + window.scrollY
    )
    await scrollTo(page, Math.round(natural + extra))
}

async function scrollTo(page: Page, position: number) {
    await page.evaluate((target) => window.scrollTo(0, target), position)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(position - 2)
}

async function top(locator: ReturnType<Page["locator"]>) {
    return locator.evaluate((element) => element.getBoundingClientRect().top)
}

async function bottom(locator: ReturnType<Page["locator"]>) {
    return locator.evaluate((element) => element.getBoundingClientRect().bottom)
}

test.describe("navegação entre documentos", () => {
    for (const language of LANGUAGES) {
        test(`RF-PROJECT-16, A11Y-PJ05: em ${language} a nav lista todos os documentos na ordem do conteúdo, com nome Documento: Projeto e aria-current no aberto`, async ({
            page
        }) => {
            const project = await openProject(page, language, MNIST)
            const nav = documentsNav(page, language)
            const names = project.documents.map((document) => document.name)
            expect(names.length).toBeGreaterThan(1)
            expect(names[0]).toBe("README.md")

            const links = nav.getByRole("link")

            await expect(links).toHaveCount(names.length)
            for (const [index, name] of names.entries()) {
                await expect(links.nth(index)).toHaveText(name)
                await expect(links.nth(index)).toHaveAccessibleName(
                    PROJECT_TEXTS[language].documentLink(name, project.title)
                )
                const box = await links.nth(index).boundingBox()
                expect(box?.height ?? 0).toBeGreaterThanOrEqual(TOUCH_TARGET)
            }
            await expect(nav.locator('[aria-current="page"]')).toHaveCount(1)
            await expect(links.first()).toHaveAttribute("aria-current", "page")
        })
    }

    test("RF-PROJECT-16: a nav de documentos aparece também em projeto que só tem README e LICENSE", async ({
        page
    }) => {
        const project = await openProject(page, "pt-BR", "Conversor de Unidades")

        await expect(documentsNav(page, "pt-BR").getByRole("link")).toHaveCount(
            project.documents.length
        )
    })

    test("RF-PROJECT-16, A11Y-PJ10: a nav fica fixa logo abaixo do cabeçalho durante a rolagem", async ({
        page
    }) => {
        await openProject(page, "pt-BR", MNIST)
        const nav = documentsNav(page, "pt-BR")
        await expect(nav).toHaveCSS("position", "sticky")

        for (const extra of [100, 600]) {
            await scrollPastNav(page, "pt-BR", extra)

            expect(Math.abs((await top(nav)) - HEADER_HEIGHT)).toBeLessThanOrEqual(
                POSITION_TOLERANCE
            )
            const box = await nav.boundingBox()
            expect(box?.height ?? 0).toBeGreaterThan(0)
        }
    })

    test("RF-PROJECT-16: a 320px a nav continua na tela, com rolagem própria quando não cabe, sem rolagem horizontal da página", async ({
        page
    }) => {
        await page.setViewportSize({ width: 320, height: 700 })
        await openProject(page, "pt-BR", MNIST)
        const nav = documentsNav(page, "pt-BR")

        await scrollPastNav(page, "pt-BR", 300)

        expect(Math.abs((await top(nav)) - HEADER_HEIGHT)).toBeLessThanOrEqual(POSITION_TOLERANCE)
        const pageOverflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        )
        expect(pageOverflow).toBeLessThanOrEqual(0)
        const box = await nav.boundingBox()
        expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320 + 1)
    })

    test("RF-PROJECT-18, RF-PROJECT-17, NF-IA-21: trocar de documento não recarrega nem remonta o projeto, empurra no histórico, troca o título e foca o título do documento", async ({
        page
    }) => {
        const project = await openProject(page, "pt-BR", MNIST)
        const texts = PROJECT_TEXTS["pt-BR"]
        await page.evaluate(() => Reflect.set(window, "e2eMarker", true))
        await page
            .getByRole("heading", { level: 1 })
            .evaluate((element) => Reflect.set(element, "e2eSameNode", true))
        const historyBefore = await page.evaluate(() => window.history.length)
        const galleryBefore = await page.getByRole("region", { name: texts.gallery }).innerHTML()

        await activateDocument(page, "pt-BR", "ARCHITECTURE.md", project.title)

        await expect(page).toHaveURL(new RegExp(`/projects/${project.id}/docs/ARCHITECTURE\\.md$`))
        await expect(page).toHaveTitle(texts.documentTitle("ARCHITECTURE.md", project.title))
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.title)
        await expect(page.getByRole("heading", { level: 3, name: "Visão geral" })).toBeVisible()
        expect(await page.evaluate(() => Reflect.get(window, "e2eMarker"))).toBe(true)
        expect(
            await page
                .getByRole("heading", { level: 1 })
                .evaluate((element) => Reflect.get(element, "e2eSameNode"))
        ).toBe(true)
        expect(await page.evaluate(() => window.history.length)).toBe(historyBefore + 1)
        expect(await page.getByRole("region", { name: texts.gallery }).innerHTML()).toBe(
            galleryBefore
        )
        await expect(documentsNav(page, "pt-BR").locator('[aria-current="page"]')).toHaveText(
            "ARCHITECTURE.md"
        )
        await expect(page.getByRole("main").getByRole("status")).toHaveCount(0)
    })

    test("RF-PROJECT-18: com o início do documento visível a troca não rola a página", async ({
        page
    }) => {
        const project = await openProject(page, "pt-BR", MNIST)
        const body = documentBody(page, "README.md")
        await scrollToTitleOf(page, "README.md", 250)
        const before = await page.evaluate(() => window.scrollY)
        expect(await top(body)).toBeGreaterThan(HEADER_HEIGHT)

        await activateDocument(page, "pt-BR", "SETUP.md", project.title)

        expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThanOrEqual(
            POSITION_TOLERANCE
        )
    })

    test("RF-PROJECT-18, RF-PROJECT-16, A11Y-PJ10: com o início do documento acima da área visível a página rola só até ele ficar logo abaixo da nav fixa", async ({
        page
    }) => {
        const project = await openProject(page, "pt-BR", MNIST)
        const nav = documentsNav(page, "pt-BR")
        await scrollPastNav(page, "pt-BR", 400)

        await activateDocument(page, "pt-BR", "ARCHITECTURE.md", project.title)

        const bodyTop = await top(documentBody(page, "ARCHITECTURE.md"))
        const navBottom = await bottom(nav)
        expect(bodyTop).toBeGreaterThanOrEqual(navBottom - POSITION_TOLERANCE)
        expect(bodyTop).toBeLessThan(navBottom + 60)
    })

    test("RF-PROJECT-18, RF-LAY-32: voltar e avançar com o título visível restauram a rolagem da entrada e põem o foco no título do documento", async ({
        page
    }) => {
        const project = await openProject(page, "pt-BR", MNIST)
        await scrollToTitleOf(page, "README.md", 250)
        const readmeScroll = await page.evaluate(() => window.scrollY)
        await activateDocument(page, "pt-BR", "SETUP.md", project.title)
        await activateDocument(page, "pt-BR", "ARCHITECTURE.md", project.title)

        await page.goBack()
        await expect(page).toHaveURL(/\/docs\/SETUP\.md$/)
        await expect(documentTitle(page, "SETUP.md")).toBeFocused()

        await page.goBack()

        await expect(page).toHaveURL(new RegExp(`/projects/${project.id}$`))
        await expect(documentTitle(page, "README.md")).toBeFocused()
        await expect
            .poll(() =>
                page.evaluate((expected) => Math.abs(window.scrollY - expected), readmeScroll)
            )
            .toBeLessThan(60)

        await page.goForward()
        await page.goForward()

        await expect(page).toHaveURL(/\/docs\/ARCHITECTURE\.md$/)
        await expect(documentTitle(page, "ARCHITECTURE.md")).toBeFocused()
    })

    test("RF-PROJECT-18, RF-LAY-32: voltar para um documento rolado bem abaixo do título restaura a rolagem daquela entrada", async ({
        page
    }) => {
        const project = await openProject(page, "pt-BR", MNIST)
        await activateDocument(page, "pt-BR", "SETUP.md", project.title)
        await scrollToTitleOf(page, "SETUP.md", -400)
        const setupScroll = await page.evaluate(() => window.scrollY)
        await activateDocument(page, "pt-BR", "ARCHITECTURE.md", project.title)

        await page.goBack()

        await expect(page).toHaveURL(/\/docs\/SETUP\.md$/)
        await expect(documentTitle(page, "SETUP.md")).toBeFocused()
        await expect
            .poll(() =>
                page.evaluate((expected) => Math.abs(window.scrollY - expected), setupScroll)
            )
            .toBeLessThan(60)
    })

    test("RF-PROJECT-19: chegar ao documento vindo de outro projeto é navegação nova, com foco no h1 e rolagem no topo", async ({
        page
    }) => {
        const player = readProjectDetail("pt-BR", "Player Profile Clustering")
        const mnist = await openProject(page, "pt-BR", MNIST)
        await scrollTo(page, 1500)

        await page.getByRole("article").getByRole("link", { name: player.title }).click()

        await expect(page).toHaveURL(new RegExp(`/projects/${player.id}$`))
        await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5)
        expect(mnist.id).not.toBe(player.id)
    })
})

test.describe("âncoras", () => {
    test("RF-PROJECT-23, A11Y-PJ10: abrir a URL com âncora rola até o título do documento, abaixo da nav fixa", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)

        await page.goto(`${projectPath("pt-BR", project.id, "ARCHITECTURE.md")}#fluxo-de-dados`)
        await page.getByRole("heading", { level: 1 }).waitFor()

        const target = page.locator("#fluxo-de-dados")
        await expect(target).toHaveText("Fluxo de dados")
        await expect(target).toBeInViewport()
        const navBottom = await bottom(documentsNav(page, "pt-BR"))
        expect(await top(target)).toBeGreaterThanOrEqual(navBottom - POSITION_TOLERANCE)
        expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(300)
    })

    test("RF-PROJECT-25, RF-PROJECT-23: o link project: com âncora, aberto por navegação do cliente, leva ao título abaixo da nav fixa", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)
        const markdown = [
            "## Início",
            "",
            `[ver fluxo](project:${project.id}/docs/ARCHITECTURE.md#fluxo-de-dados)`
        ].join("\n")
        await page.route(`**/content/pt-BR/projects/${project.id}/docs/SETUP.md`, (route) =>
            route.fulfill({ contentType: "text/markdown", body: markdown })
        )
        await page.goto(projectPath("pt-BR", project.id))
        await page.getByRole("heading", { level: 1 }).waitFor()
        await activateDocument(page, "pt-BR", "SETUP.md", project.title)

        await page.getByRole("link", { name: "ver fluxo" }).click()

        const target = page.locator("#fluxo-de-dados")
        await expect(target).toBeVisible()
        await expect(target).toBeInViewport()
        expect(await top(target)).toBeGreaterThanOrEqual(
            (await bottom(documentsNav(page, "pt-BR"))) - POSITION_TOLERANCE
        )
    })

    test("RF-PROJECT-25, RF-PROJECT-23: o link #âncora do markdown rola até o título abaixo da nav fixa", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)
        const filler = Array.from({ length: 40 }, (_value, index) => `Parágrafo ${index}.`).join(
            "\n\n"
        )
        const markdown = [
            "## Topo",
            "",
            "[ir ao fim](#fim)",
            "",
            filler,
            "",
            "## Fim",
            "",
            "texto"
        ].join("\n")
        await page.route(`**/content/pt-BR/projects/${project.id}/docs/SETUP.md`, (route) =>
            route.fulfill({ contentType: "text/markdown", body: markdown })
        )
        await page.goto(projectPath("pt-BR", project.id))
        await page.getByRole("heading", { level: 1 }).waitFor()
        await activateDocument(page, "pt-BR", "SETUP.md", project.title)

        await page.getByRole("link", { name: "ir ao fim" }).click()

        const target = page.locator("#fim")
        await expect(target).toBeInViewport()
        expect(await top(target)).toBeGreaterThanOrEqual(
            (await bottom(documentsNav(page, "pt-BR"))) - POSITION_TOLERANCE
        )
        expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(300)
    })

    test("RF-PROJECT-23, A11Y-PJ10: a âncora do README também fica abaixo da nav fixa a 390px e 1280px", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)

        await page.goto(`${projectPath("pt-BR", project.id)}#resultado`)
        await page.getByRole("heading", { level: 1 }).waitFor()

        const target = page.locator("#resultado")
        await expect(target).toBeInViewport()
        expect(await top(target)).toBeGreaterThanOrEqual(
            (await bottom(documentsNav(page, "pt-BR"))) - POSITION_TOLERANCE
        )
    })

    test("RF-PROJECT-23: âncora que não existe é ignorada, a tela abre no topo sem erro", async ({
        page
    }) => {
        const problems = collectConsoleProblems(page)
        const project = readProjectDetail("pt-BR", MNIST)

        await page.goto(`${projectPath("pt-BR", project.id)}#nao-existe`)
        await page.getByRole("heading", { level: 1 }).waitFor()

        expect(await page.evaluate(() => window.scrollY)).toBe(0)
        expect(problems).toEqual([])
    })

    test("RF-PROJECT-19, NF-IN-10: trocar de idioma num documento mantém o documento, o projeto e a âncora", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)
        await page.goto(`${projectPath("pt-BR", project.id, "ARCHITECTURE.md")}#fluxo-de-dados`)
        await page.getByRole("heading", { level: 1 }).waitFor()

        await chooseLanguageInHeader(page, "pt-BR", "en")

        await expect(page).toHaveURL(
            new RegExp(`/en/projects/${project.id}/docs/ARCHITECTURE\\.md#fluxo-de-dados$`)
        )
        await expect(page.locator("html")).toHaveAttribute("lang", "en")
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            readProjectDetail("en", MNIST).title
        )
        await expect(documentTitle(page, "ARCHITECTURE.md")).toHaveCount(1)
        await expect(documentBody(page, "ARCHITECTURE.md")).toBeVisible()
        await expect(documentsNav(page, "en").locator('[aria-current="page"]')).toHaveText(
            "ARCHITECTURE.md"
        )
    })
})

test.describe("documento de texto", () => {
    for (const language of LANGUAGES) {
        test(`RF-PROJECT-39, RF-PROJECT-20: em ${language} a LICENSE sai num pre focável, nomeado pelo título e com lang en`, async ({
            page
        }) => {
            const project = await openProject(page, language, MNIST, "LICENSE")

            const block = page.getByRole("region", { name: "LICENSE", exact: true })

            await expect(block).toContainText("MIT License")
            await expect(block).toHaveAttribute("tabindex", "0")
            await expect(block).toHaveAttribute("lang", "en")
            expect(await block.evaluate((element) => element.tagName)).toBe("PRE")
            await expect(page.getByRole("heading", { level: 2, name: "LICENSE" })).toHaveCount(1)
            await expect(page).toHaveTitle(
                PROJECT_TEXTS[language].documentTitle("LICENSE", project.title)
            )
            await expect(block.getByRole("link")).toHaveCount(0)
        })
    }

    test("RF-PROJECT-39, NF-DE-09, NF-DE-18: a LICENSE não pede o chunk do markdown, o README pede, e a troca da LICENSE para o README o carrega", async ({
        page
    }) => {
        const requested: string[] = []
        page.on("request", (request) => {
            if (MARKDOWN_CHUNK.test(request.url())) {
                requested.push(request.url())
            }
        })
        const project = readProjectDetail("pt-BR", MNIST)

        await page.goto(projectPath("pt-BR", project.id, "LICENSE"))
        await page.getByRole("heading", { level: 1 }).waitFor()
        await expect(page.getByRole("region", { name: "LICENSE" })).toBeVisible()
        expect(requested).toEqual([])

        await activateDocument(page, "pt-BR", "README.md", project.title)

        await expect(page.getByRole("heading", { level: 3, name: "Contexto" })).toBeVisible()
        expect(requested.length).toBeGreaterThan(0)
    })

    test("NF-DE-09, NF-DE-18: Início, Projetos e a tela de um projeto na LICENSE não pedem o chunk do markdown; o README pede", async ({
        page
    }) => {
        const requested: string[] = []
        page.on("request", (request) => {
            if (MARKDOWN_CHUNK.test(request.url())) {
                requested.push(request.url())
            }
        })
        const project = readProjectDetail("pt-BR", MNIST)

        for (const route of [
            "pt-BR",
            "pt-BR/projects",
            projectPath("pt-BR", project.id, "LICENSE")
        ]) {
            await page.goto(route)
            await page.getByRole("heading", { level: 1 }).waitFor()
        }
        expect(requested).toEqual([])

        await page.goto(projectPath("pt-BR", project.id))
        await page.getByRole("heading", { level: 1 }).waitFor()
        await expect.poll(() => requested.length).toBeGreaterThan(0)
    })
})

test.describe("markdown", () => {
    test("RF-PROJECT-23, RF-PROJECT-17: o documento tem um único h1, o h2 do título e os títulos do markdown rebaixados para h3", async ({
        page
    }) => {
        await openProject(page, "pt-BR", MNIST)

        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
        await expect(documentTitle(page, "README.md")).toHaveAttribute("tabindex", "-1")
        for (const heading of [
            "Contexto",
            "Meu papel",
            "Solução",
            "Decisões técnicas",
            "Resultado"
        ]) {
            await expect(page.getByRole("heading", { level: 3, name: heading })).toBeVisible()
            await expect(page.getByRole("heading", { level: 3, name: heading })).toHaveAttribute(
                "id",
                /.+/
            )
        }
    })

    test("RF-PROJECT-17, RF-PROJECT-18: o h2 do documento fica no DOM só para leitores e foco, visualmente oculto, e o conteúdo vem num contêiner com borda e respiro", async ({
        page
    }) => {
        await openProject(page, "pt-BR", MNIST)
        const title = documentTitle(page, "README.md")
        const body = documentBody(page, "README.md")

        await expect(title).toHaveCount(1)
        await expect(title).toHaveAttribute("tabindex", "-1")
        const titleBox = await title.boundingBox()
        expect(titleBox?.width ?? 0).toBeLessThanOrEqual(1)
        expect(titleBox?.height ?? 0).toBeLessThanOrEqual(1)
        await expect(body).toBeVisible()
        await expect(body).toHaveCSS("border-top-width", "1px")
        const padding = isNarrow(page) ? "16px" : "24px"
        await expect(body).toHaveCSS("padding-left", padding)
        await expect(body).toHaveCSS("padding-top", padding)
        expect(
            await page.evaluate(() => {
                const heading = Array.from(document.querySelectorAll("h2")).find(
                    (element) => element.textContent === "README.md"
                )
                return heading?.nextElementSibling?.tagName
            })
        ).toBe("DIV")
    })

    for (const [language, headings] of [
        [
            "pt-BR",
            ["Contexto", "Meu papel", "Solução", "Decisões técnicas", "Resultado", "Aprendizados"]
        ],
        ["en", ["Context", "My role", "Solution", "Technical decisions", "Outcome", "Learnings"]],
        [
            "es",
            ["Contexto", "Mi rol", "Solución", "Decisiones técnicas", "Resultado", "Aprendizajes"]
        ]
    ] as const) {
        test(`RF-PROJECT-27, RF-PROJECT-20: o README em ${language} traz as seções na ordem, com os títulos do idioma`, async ({
            page
        }) => {
            await openProject(page, language, MNIST)

            await expect(
                page
                    .getByRole("main")
                    .getByRole("heading", { level: 3 })
                    .filter({ hasNotText: /^$/ })
            ).toContainText([...headings])
        })
    }

    test("RF-PROJECT-24, A11Y-PJ07: o bloco de código tem cabeçalho com a linguagem, é focável por Tab e nomeado pelo cabeçalho", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)
        await page.goto(projectPath("pt-BR", project.id, "SETUP.md"))
        await page.getByRole("heading", { level: 1 }).waitFor()
        const block = page.getByRole("region", { name: "Bash" }).first()

        await expect(block).toHaveAttribute("tabindex", "0")
        expect(await block.evaluate((element) => element.tagName)).toBe("PRE")
        expect(await block.evaluate((element) => getComputedStyle(element).whiteSpace)).toBe("pre")

        let reached = false
        await page.getByRole("heading", { level: 2, name: "SETUP.md" }).focus()
        for (let step = 0; step < 15 && !reached; step++) {
            await page.keyboard.press("Tab")
            reached = await block.evaluate((element) => element === document.activeElement)
        }
        expect(reached).toBe(true)
        expect(await block.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
            "none"
        )
    })

    test("RF-PROJECT-25, RF-PROJECT-37: link externo do markdown abre em nova aba com aviso no nome e rel seguro", async ({
        page
    }) => {
        await openProject(page, "pt-BR", MNIST)

        const link = page.getByRole("link", { name: /issue #1 do mnist-classifier-ai/ })

        await expect(link).toHaveAccessibleName(/\(abre em nova aba\)$/)
        await expect(link).toHaveAttribute("target", "_blank")
        await expect(link).toHaveAttribute("rel", "noopener noreferrer")
    })

    test("RF-PROJECT-22, RF-PROJECT-25, RF-PROJECT-38: HTML, imagem e link perigoso são descartados, tabela e tarefas ganham semântica e project: vira link interno", async ({
        page
    }) => {
        const mnist = readProjectDetail("pt-BR", MNIST)
        const player = readProjectDetail("pt-BR", "Player Profile Clustering")
        const markdown = [
            "## Seção",
            "",
            "<script>window.e2eInjected = true</script>",
            "",
            "<b>negrito html</b>",
            "",
            "![imagem proibida](https://example.com/a.png)",
            "",
            "[perigoso](javascript:window.e2eInjected=true) e [interno](project:" +
                player.id +
                "/docs/SETUP.md) e [email](mailto:a@b.co) e [externo](https://example.com) e [ancora](#secao)",
            "",
            "| Nome | Valor |",
            "| :--- | ---: |",
            "| a | 1 |",
            "",
            "- [x] pronto",
            "- [ ] pendente",
            "",
            "~~riscado~~",
            "",
            "# Título um"
        ].join("\n")
        await page.goto(PROBE)
        await page.getByRole("heading", { level: 1 }).waitFor()
        const problems = collectConsoleProblems(page)
        await page.route(`**/content/pt-BR/projects/${mnist.id}/docs/SETUP.md`, (route) =>
            route.fulfill({ contentType: "text/markdown", body: markdown })
        )
        await navigateClientSide(page, projectPath("pt-BR", mnist.id))
        await page.getByRole("heading", { level: 1, name: mnist.title }).waitFor()
        await page.evaluate(() => Reflect.set(window, "e2eInjected", false))

        await activateDocument(page, "pt-BR", "SETUP.md", mnist.title)

        const main = page.getByRole("main")
        await expect(main.getByRole("heading", { level: 3, name: "Seção" })).toBeVisible()
        await expect(main.getByRole("heading", { level: 3, name: "Título um" })).toBeVisible()
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
        await expect(main.locator("b")).toHaveCount(0)
        await expect(main.locator('script:not([type="application/ld+json"])')).toHaveCount(0)
        await expect(main.getByRole("img", { name: "imagem proibida" })).toHaveCount(0)
        await expect(main.getByRole("link", { name: "perigoso" })).toHaveCount(0)
        await expect(main.getByText("perigoso")).toBeVisible()
        expect(await page.evaluate(() => Reflect.get(window, "e2eInjected"))).toBe(false)
        await expect(main.getByRole("link", { name: "interno" })).toHaveAttribute(
            "href",
            new RegExp(`/pt-BR/projects/${player.id}/docs/SETUP\\.md$`)
        )
        await expect(main.getByRole("link", { name: "interno" })).not.toHaveAttribute(
            "target",
            /.+/
        )
        await expect(main.getByRole("link", { name: "email" })).toHaveAttribute(
            "href",
            "mailto:a@b.co"
        )
        await expect(main.getByRole("link", { name: "email" })).not.toHaveAttribute("target", /.+/)
        await expect(main.getByRole("link", { name: /externo/ })).toHaveAttribute(
            "target",
            "_blank"
        )
        await expect(main.getByRole("link", { name: "ancora" })).toHaveAttribute("href", "#secao")
        const table = main.getByRole("region", { name: "Tabela 1" })
        await expect(table).toHaveAttribute("tabindex", "0")
        await expect(table.getByRole("columnheader", { name: "Nome" })).toHaveAttribute(
            "scope",
            "col"
        )
        await expect(main.getByRole("checkbox", { name: "Feito" })).toBeDisabled()
        await expect(main.getByRole("checkbox", { name: "Feito" })).toBeChecked()
        await expect(main.getByRole("checkbox", { name: "A fazer" })).not.toBeChecked()
        await expect(main.locator("del")).toHaveText("riscado")
        expect(problems).toEqual([])
    })

    test("RF-PROJECT-31: um erro de carga do documento markdown não derruba a tela e a nav segue", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)
        await openProject(page, "pt-BR", MNIST)
        await page.route(`**/content/pt-BR/projects/${project.id}/docs/ARCHITECTURE.md`, (route) =>
            route.fulfill({ status: 500, body: "erro" })
        )

        await activateDocument(page, "pt-BR", "ARCHITECTURE.md", project.title)

        await expect(
            page.getByRole("alert").getByText(PROJECT_TEXTS["pt-BR"].documentErrorHeading)
        ).toBeVisible()
        await expect(documentsNav(page, "pt-BR").getByRole("link")).toHaveCount(
            project.documents.length
        )
    })
})

test.describe("teclado", () => {
    test("A11Y-G05, A11Y-G06, RF-PROJECT-16: a ordem de foco segue o DOM, cada alvo tem contorno visível e chega à nav e aos blocos", async ({
        page
    }) => {
        await openProject(page, "pt-BR", MNIST)
        const visited: string[] = []

        for (let step = 0; step < 40; step++) {
            await page.keyboard.press("Tab")
            const info = await page.evaluate(() => {
                const active = document.activeElement
                if (!active || active === document.body) {
                    return undefined
                }
                const style = getComputedStyle(active)
                return {
                    label: active.getAttribute("aria-label") ?? active.textContent?.trim() ?? "",
                    outline: style.outlineStyle,
                    insideNav: Boolean(active.closest("nav[aria-label]:not(header nav)")),
                    focusVisible: active.matches(":focus-visible")
                }
            })
            if (!info) {
                break
            }
            expect(info.focusVisible).toBe(true)
            expect(info.outline === "none" ? "sem contorno" : "com contorno").toBe("com contorno")
            visited.push(info.label)
        }

        const documentLinks = visited
            .filter((label) => /^(README\.md|ARCHITECTURE\.md|SETUP\.md|LICENSE): /.test(label))
            .map((label) => label.split(": ")[0])
        expect(documentLinks).toEqual(["README.md", "ARCHITECTURE.md", "SETUP.md", "LICENSE"])
        expect(visited.findIndex((label) => label.startsWith("README.md: "))).toBeGreaterThan(
            visited.findIndex((label) => /Ver código no GitHub/.test(label))
        )
    })

    test("A11Y-PJ10: com a nav fixa, o elemento focado por Tab dentro do documento nunca fica atrás dela", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)
        await page.goto(projectPath("pt-BR", project.id, "SETUP.md"))
        await page.getByRole("heading", { level: 1 }).waitFor()
        const nav = documentsNav(page, "pt-BR")
        await page.getByRole("heading", { level: 2, name: "SETUP.md" }).focus()

        for (let step = 0; step < 8; step++) {
            await page.keyboard.press("Tab")
            const focused = await page.evaluate(() => {
                const active = document.activeElement
                return active ? active.getBoundingClientRect().top : 0
            })
            const navBottom = await bottom(nav)
            expect(focused).toBeGreaterThanOrEqual(navBottom - POSITION_TOLERANCE)
        }
    })
})

test.describe("âncora entre documentos", () => {
    test("RF-PROJECT-25, RF-PROJECT-19: o link project: com âncora leva ao documento e ao id do projeto citados", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)
        const destination = readProjectDetail("pt-BR", "Player Profile Clustering")
        expect(destination.id).not.toBe(project.id)
        const markdown = `## Início\n\n[ver fluxo](project:${destination.id}/docs/ARCHITECTURE.md#fluxo-de-dados)\n`
        await page.route(`**/content/pt-BR/projects/${project.id}/docs/SETUP.md`, (route) =>
            route.fulfill({ contentType: "text/markdown", body: markdown })
        )
        await page.goto(projectPath("pt-BR", project.id))
        await page.getByRole("heading", { level: 1 }).waitFor()
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.title)
        await activateDocument(page, "pt-BR", "SETUP.md", project.title)

        await page.getByRole("link", { name: "ver fluxo" }).click()

        await expect(page).toHaveURL(
            new RegExp(`/projects/${destination.id}/docs/ARCHITECTURE\\.md#fluxo-de-dados$`)
        )
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(destination.title)
        const target = page.locator("#fluxo-de-dados")
        await expect(target).toBeVisible()
        const nav = documentsNav(page, "pt-BR")
        await expect
            .poll(async () => (await top(target)) - (await bottom(nav)), { timeout: 5000 })
            .toBeGreaterThanOrEqual(-POSITION_TOLERANCE)
        await expect
            .poll(async () => (await top(target)) - (await bottom(nav)), { timeout: 5000 })
            .toBeLessThan(ANCHOR_MAX_GAP)
    })
})

test.describe("acessibilidade do documento", () => {
    test("A11Y-G04, A11Y-G10, A11Y-PJ08: um documento com blocos de código de nomes distintos e uma tabela não tem violações do axe, com contraste", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)
        const markdown = [
            "## Seção",
            "",
            "Texto com `código em linha` e [link](https://example.com).",
            "",
            '```ts title="src/group.ts"',
            "const total: number = 42",
            "function sum(a: number): string { return `${a}` }",
            "```",
            "",
            "```bash",
            "npm run build",
            "```",
            "",
            "```",
            "sem linguagem",
            "```",
            "",
            "| Nome | Valor |",
            "| :--- | ---: |",
            "| a | 1 |",
            "",
            "> citação",
            "",
            "- [x] feito",
            "- [ ] a fazer"
        ].join("\n")
        await page.route(`**/content/pt-BR/projects/${project.id}/docs/SETUP.md`, (route) =>
            route.fulfill({ contentType: "text/markdown", body: markdown })
        )
        await page.goto(projectPath("pt-BR", project.id))
        await page.getByRole("heading", { level: 1 }).waitFor()
        await activateDocument(page, "pt-BR", "SETUP.md", project.title)
        await expect(page.getByRole("region", { name: "Tabela 1" })).toBeVisible()
        await expect(page.getByRole("region", { name: "Bash" })).toBeVisible()
        await expect(page.getByRole("region", { name: "Código", exact: true })).toBeVisible()

        await expectNoAxeViolations(page)
    })
})

test.describe("rolagem suave com movimento pleno", () => {
    test.use({ reducedMotion: "no-preference" })

    test("RF-PROJECT-18, A11Y-PJ10: com movimento pleno a troca de documento termina com o início do documento abaixo da nav fixa", async ({
        page
    }) => {
        const project = await openProject(page, "pt-BR", MNIST)
        const nav = documentsNav(page, "pt-BR")
        await scrollPastNav(page, "pt-BR", 400)

        await activateDocument(page, "pt-BR", "ARCHITECTURE.md", project.title)

        const body = documentBody(page, "ARCHITECTURE.md")
        await expect
            .poll(async () => (await top(body)) - (await bottom(nav)), { timeout: 5000 })
            .toBeGreaterThanOrEqual(-POSITION_TOLERANCE)
        await expect
            .poll(async () => (await top(body)) - (await bottom(nav)), { timeout: 5000 })
            .toBeLessThan(ANCHOR_MAX_GAP)
    })

    test("RF-PROJECT-23, A11Y-PJ10: com movimento pleno a âncora do documento termina com o título abaixo da nav fixa", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)

        await page.goto(`${projectPath("pt-BR", project.id, "ARCHITECTURE.md")}#fluxo-de-dados`)
        await page.getByRole("heading", { level: 1 }).waitFor()

        const target = page.locator("#fluxo-de-dados")
        const nav = documentsNav(page, "pt-BR")
        await expect
            .poll(async () => (await top(target)) - (await bottom(nav)), { timeout: 5000 })
            .toBeGreaterThanOrEqual(-POSITION_TOLERANCE)
        await expect
            .poll(async () => (await top(target)) - (await bottom(nav)), { timeout: 5000 })
            .toBeLessThan(ANCHOR_MAX_GAP)
        await expect(target).toBeInViewport()
        expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    })
})
