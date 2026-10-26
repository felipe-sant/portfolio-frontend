import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import collectConsoleProblems from "./support/collectConsoleProblems"
import filterProjects from "./support/filterProjects"
import getProjectsView from "./support/getProjectsView"
import navigateClientSide from "./support/navigateClientSide"
import openProject from "./support/openProject"
import openProjectsFromHeader from "./support/openProjectsFromHeader"
import PROJECT_TEXTS from "./support/projectTexts"
import projectPath from "./support/projectPath"
import readProjectDetail from "./support/readProjectDetail"
import readRawProjects from "./support/readRawProjects"
import serveProjectFixture from "./support/serveProjectFixture"
import serveProjectsFixture from "./support/serveProjectsFixture"
import UI_TEXTS from "./support/uiTexts"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const MNIST = "MNIST Classifier"
const PLAYER = "Player Profile Clustering"
const WITH_DEMO = "Pedido de Namoro Irrecusável"
const TOUCH_TARGET = 44
const BATCH = 9
const DESKTOP_MIN_WIDTH = 980
const NOT_FOUND_PROBE = "pt-BR/rota-inexistente"
const OLD_REASON_MARKER = "Outro modelo de Machine Learning que construí"
const MISSING_ID = "01a131df-93ee-72f3-8c7a-f67501e47a7b"

function isWide(page: Page) {
    return (page.viewportSize()?.width ?? 0) >= DESKTOP_MIN_WIDTH
}

async function markPage(page: Page) {
    await page.evaluate(() => Reflect.set(window, "e2eMarker", true))
}

async function readMark(page: Page) {
    return page.evaluate(() => Reflect.get(window, "e2eMarker"))
}

test.describe("rotas do projeto", () => {
    for (const language of LANGUAGES) {
        const texts = PROJECT_TEXTS[language]

        test(`RF-PROJECT-15, NF-IN-13, RF-PROJECT-35: em ${language} o projeto e o documento SETUP.md abrem, recarregam e trazem lang, título e h1 do idioma`, async ({
            page
        }) => {
            const project = readProjectDetail(language, MNIST)
            const problems = collectConsoleProblems(page)

            for (const documentName of [undefined, "SETUP.md"]) {
                const response = await page.goto(projectPath(language, project.id, documentName))
                expect(response?.status()).toBe(200)
                await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.title)
                await expect(page.locator("html")).toHaveAttribute("lang", language)
                await expect(page).toHaveTitle(
                    documentName
                        ? texts.documentTitle(documentName, project.title)
                        : texts.title(project.title)
                )
                await expect(
                    page.getByRole("heading", { level: 2, name: documentName ?? "README.md" })
                ).toHaveCount(1)

                await page.reload()
                await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.title)
            }

            expect(problems).toEqual([])
        })

        test(`RF-PROJECT-11, RF-PROJECT-13, RF-PROJECT-02: em ${language} cabeçalho, ficha técnica e stack mostram os dados do conteúdo`, async ({
            page
        }) => {
            const project = await openProject(page, language, MNIST)
            const main = page.getByRole("main")

            await expect(main.getByText(project.summary)).toBeVisible()
            await expect(main.getByText(texts.featured, { exact: true }).first()).toBeVisible()
            await expect(
                main.getByRole("heading", { level: 2, name: texts.factsHeading })
            ).toBeVisible()
            await expect(main.locator("dt")).toHaveCount(7)
            await expect(main.locator("dd time")).toHaveAttribute("datetime", project.date)
            await expect(main.locator("dd").last()).toHaveText(texts.status.completed)
            await expect(
                main.getByRole("heading", { level: 2, name: texts.stackHeading })
            ).toBeVisible()
            await expect(main.getByRole("heading", { level: 3 }).first()).toBeVisible()
            await expect(main.getByRole("listitem").filter({ hasText: /^React$/ })).toBeVisible()
        })
    }

    test("RF-PROJECT-02: o selo Em destaque só aparece em projeto destaque", async ({ page }) => {
        await openProject(page, "pt-BR", "Controle de Despesas")

        await expect(
            page.getByRole("main").getByText(PROJECT_TEXTS["pt-BR"].featured, { exact: true })
        ).toHaveCount(0)
    })

    test("RF-PROJECT-37, RF-PROJECT-15: o card da lista de Projetos e o destaque da Início levam ao projeto no idioma", async ({
        page
    }) => {
        const project = readProjectDetail("en", PLAYER)
        await page.goto("en/projects")
        const view = getProjectsView(page, "en")

        await view.cardLinks.filter({ hasText: project.title }).click()

        await expect(page).toHaveURL(new RegExp(`/en/projects/${project.id}$`))
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.title)

        await page.goto("es")
        await page
            .getByRole("article")
            .getByRole("link", { name: readProjectDetail("es", PLAYER).title })
            .click()

        await expect(page).toHaveURL(new RegExp(`/es/projects/${project.id}$`))
    })

    test("RF-PROJECT-37, NF-IN-06: o caminho do projeto sem prefixo de idioma cai na não encontrada com 404", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)

        const response = await page.goto(`projects/${project.id}`)

        expect(response?.status()).toBe(404)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            UI_TEXTS.en.notFoundHeading
        )
    })
})

test.describe("não encontrado", () => {
    const project = readProjectDetail("pt-BR", MNIST)
    const missing = [
        ["id fora do formato", "pt-BR/projects/nao-e-uuid"],
        ["id inexistente", `pt-BR/projects/${MISSING_ID}`],
        ["documento inexistente", projectPath("pt-BR", project.id, "NAO-EXISTE.md")],
        ["README.md como documento", projectPath("pt-BR", project.id, "README.md")],
        ["subcaminho desconhecido", `${projectPath("pt-BR", project.id)}/outro`]
    ]

    for (const [name, route] of missing) {
        const hasFooter = name !== "subcaminho desconhecido"
        test(`RF-PROJECT-34, NF-IA-04, RF-LAY-28: ${name} responde 404 e mostra a não encontrada em pt-BR`, async ({
            page
        }) => {
            const response = await page.goto(route)

            expect(response?.status()).toBe(404)
            await expect(page.getByRole("heading", { level: 1 })).toHaveText(
                UI_TEXTS["pt-BR"].notFoundHeading
            )
            await expect(page.getByRole("banner")).toBeVisible()
            await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR")
        })

        test(`RF-LAY-28: ${name} ${hasFooter ? "mostra" : "não mostra"} o rodapé padrão`, async ({
            page
        }) => {
            await page.goto(route)
            await page.getByRole("heading", { level: 1 }).waitFor()

            await expect(page.getByRole("contentinfo")).toHaveCount(hasFooter ? 1 : 0)
        })
    }

    test("RF-PROJECT-34: na navegação do cliente, id inexistente e documento inexistente mostram a não encontrada", async ({
        page
    }) => {
        await page.goto(NOT_FOUND_PROBE)
        await page.getByRole("heading", { level: 1 }).waitFor()

        for (const route of [
            projectPath("pt-BR", MISSING_ID),
            projectPath("pt-BR", project.id, "NAO-EXISTE.md"),
            projectPath("pt-BR", project.id, "README.md")
        ]) {
            await navigateClientSide(page, route)
            await expect(page).toHaveURL(new RegExp(route.replace(/\./g, "\\.")))
            await expect(page.getByRole("heading", { level: 1 })).toHaveText(
                UI_TEXTS["pt-BR"].notFoundHeading
            )
        }
    })

    test("RF-PROJECT-15: o nome do documento em outra caixa troca a URL pelo nome exato sem passo extra no histórico", async ({
        page
    }) => {
        await page.goto(NOT_FOUND_PROBE)
        await page.getByRole("heading", { level: 1 }).waitFor()
        await navigateClientSide(page, projectPath("pt-BR", project.id, "setup.md"))
        const historyBefore = await page.evaluate(() => window.history.length)

        await expect(page).toHaveURL(new RegExp(`/docs/SETUP\\.md$`))

        await expect(page.getByRole("heading", { level: 2, name: "SETUP.md" })).toBeVisible()
        expect(await page.evaluate(() => window.history.length)).toBe(historyBefore)
    })
})

test.describe("barra de volta", () => {
    test("RF-PROJECT-01, NF-IN-11: o link aponta para a lista do idioma, sem query", async ({
        page
    }) => {
        for (const language of LANGUAGES) {
            await openProject(page, language, MNIST)

            await expect(
                page.getByRole("link", { name: PROJECT_TEXTS[language].back })
            ).toHaveAttribute("href", `${FATEC_BASE_PATH}${language}/projects`)
        }
    })

    test("RF-PROJECT-01: abrindo a URL direto, o link abre a lista sem query no topo", async ({
        page
    }) => {
        await openProject(page, "pt-BR", MNIST)

        await page.getByRole("link", { name: PROJECT_TEXTS["pt-BR"].back }).click()

        await expect(page).toHaveURL(/\/pt-BR\/projects$/)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            PROJECT_TEXTS["pt-BR"].projectsHeading
        )
    })

    test("RF-PROJECT-01, RF-PROJECTS-25: voltar devolve a lista com busca, quantidade e rolagem, também depois de trocar de documento", async ({
        page
    }) => {
        const projects = await serveProjectsFixture(page, "pt-BR", 20)
        await openProjectsFromHeader(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        await view.search.fill("e")
        const matches = filterProjects(projects, { q: "e" })
        expect(matches.length).toBeGreaterThan(BATCH)
        await expect(page).toHaveURL(/\?q=e$/)
        await expect(view.status).toHaveText(view.texts.count(BATCH, matches.length))
        await view.loadMore.click()
        const shown = Math.min(BATCH * 2, matches.length)
        await expect(view.cards).toHaveCount(shown)
        await expect(view.cardLinks.nth(BATCH)).toBeFocused()
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await view.cardLinks.last().focus()
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000)
        const scrollBefore = await page.evaluate(() => window.scrollY)
        await page.keyboard.press("Enter")
        await expect(page).toHaveURL(/\/pt-BR\/projects\/[0-9a-f-]+$/)
        const documentsNav = page.getByRole("navigation", {
            name: PROJECT_TEXTS["pt-BR"].documentsLabel
        })
        await documentsNav.getByRole("link").nth(1).click()
        await expect(page).toHaveURL(/\/docs\/[^/]+$/)

        await page.getByRole("link", { name: PROJECT_TEXTS["pt-BR"].back }).click()

        await expect(page).toHaveURL(/\/pt-BR\/projects\?q=e$/)
        await expect(view.search).toHaveValue("e")
        await expect(view.status).toHaveText(view.texts.count(shown, matches.length))
        await expect(view.cards).toHaveCount(shown)
        await expect
            .poll(() => page.evaluate(() => window.scrollY))
            .toBeGreaterThan(scrollBefore - 50)
        expect(await page.evaluate(() => window.scrollY)).toBeLessThan(scrollBefore + 50)
    })

    test("RF-PROJECT-01: com Voltar para Projetos depois de trocar de documento, o clique volta à lista com a busca", async ({
        page
    }) => {
        const mnist = readProjectDetail("pt-BR", MNIST)
        await openProjectsFromHeader(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        await view.search.fill("a")
        await expect(page).toHaveURL(/\?q=a$/)
        const shown = await view.cards.count()
        await view.cardLinks.filter({ hasText: mnist.title }).click()
        await expect(page).toHaveURL(new RegExp(`/projects/${mnist.id}$`))
        await page
            .getByRole("navigation", { name: PROJECT_TEXTS["pt-BR"].documentsLabel })
            .getByRole("link", {
                name: PROJECT_TEXTS["pt-BR"].documentLink("SETUP.md", mnist.title)
            })
            .click()
        await expect(page).toHaveURL(/\/docs\/SETUP\.md$/)

        await page.getByRole("link", { name: PROJECT_TEXTS["pt-BR"].back }).click()

        await expect(page).toHaveURL(/\/pt-BR\/projects\?q=a$/)
        await expect(view.search).toHaveValue("a")
        await expect(view.cards).toHaveCount(shown)
    })
})

test.describe("carregando e erro", () => {
    test("RF-PROJECT-29, A11Y-G13: carregando mostra a barra de volta, o status oculto, o título provisório e depois foca o h1", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)
        const texts = PROJECT_TEXTS["pt-BR"]
        const gate = Promise.withResolvers<void>()
        await page.goto(NOT_FOUND_PROBE)
        await page.getByRole("heading", { level: 1 }).waitFor()
        await page.route("**/content/pt-BR/projects.json", async (route) => {
            await gate.promise
            await route.continue()
        })

        await navigateClientSide(page, projectPath("pt-BR", project.id))

        await expect(page.getByRole("link", { name: texts.back })).toBeVisible()
        await expect(page.getByRole("main").getByRole("status")).toHaveText(texts.loading)
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(0)
        await expect(page).toHaveTitle(texts.fallbackTitle)

        gate.resolve()

        await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.title)
        await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
    })

    test("RF-PROJECT-30, A11Y-G14: o erro do projeto mostra o alerta e Tentar novamente refaz a requisição sem recarregar", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)
        const texts = PROJECT_TEXTS["pt-BR"]
        await page.goto(NOT_FOUND_PROBE)
        await page.getByRole("heading", { level: 1 }).waitFor()
        await markPage(page)
        await page.route("**/content/pt-BR/projects.json", (route) => route.abort())

        await navigateClientSide(page, projectPath("pt-BR", project.id))

        const alert = page.getByRole("alert")
        await expect(alert.getByRole("heading", { level: 1 })).toHaveText(texts.loadErrorHeading)
        await expect(page).toHaveTitle(texts.fallbackTitle)
        await expect(page.getByRole("link", { name: texts.back })).toBeVisible()
        await expect(alert.getByRole("link", { name: texts.otherProjects })).toHaveAttribute(
            "href",
            `${FATEC_BASE_PATH}pt-BR/projects`
        )
        await expect(alert).not.toContainText("Failed")

        await page.unroute("**/content/pt-BR/projects.json")
        await alert.getByRole("button", { name: texts.retry }).click()

        await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.title)
        await expect(page.getByRole("alert")).toHaveCount(0)
        expect(await readMark(page)).toBe(true)
    })

    test("RF-PROJECT-30: Ver outros projetos leva à lista do idioma", async ({ page }) => {
        const project = readProjectDetail("en", MNIST)
        await page.goto("en/rota-inexistente")
        await page.getByRole("heading", { level: 1 }).waitFor()
        await page.route("**/content/en/projects.json", (route) => route.abort())
        await navigateClientSide(page, projectPath("en", project.id))

        await page
            .getByRole("alert")
            .getByRole("link", { name: PROJECT_TEXTS.en.otherProjects })
            .click()

        await expect(page).toHaveURL(/\/en\/projects$/)
    })

    test("RF-PROJECT-31: o erro do documento mostra o alerta depois do título, mantém a navegação e Tentar novamente refaz só o documento", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)
        const texts = PROJECT_TEXTS["pt-BR"]
        const pattern = `**/content/pt-BR/projects/${project.id}/docs/SETUP.md`
        await openProject(page, "pt-BR", MNIST)
        await markPage(page)
        await page.route(pattern, (route) => route.abort())

        await page
            .getByRole("link", { name: texts.documentLink("SETUP.md", project.title) })
            .click()

        const alert = page.getByRole("alert")
        await expect(alert.getByText(texts.documentErrorHeading)).toBeVisible()
        await expect(page.getByRole("heading", { level: 2, name: "SETUP.md" })).toBeVisible()
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.title)
        await expect(page.getByRole("navigation", { name: texts.documentsLabel })).toBeVisible()

        await page.unroute(pattern)
        await alert.getByRole("button", { name: texts.retry }).click()

        await expect(page.getByRole("heading", { level: 3, name: "Pré-requisitos" })).toBeVisible()
        await expect(page.getByRole("alert")).toHaveCount(0)
        expect(await readMark(page)).toBe(true)
    })

    test("RF-PROJECT-31: ao trocar de documento aparece o status Carregando só na área do documento", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", MNIST)
        const texts = PROJECT_TEXTS["pt-BR"]
        const gate = Promise.withResolvers<void>()
        await openProject(page, "pt-BR", MNIST)
        await page.route(
            `**/content/pt-BR/projects/${project.id}/docs/ARCHITECTURE.md`,
            async (route) => {
                await gate.promise
                await route.continue()
            }
        )

        await page
            .getByRole("link", { name: texts.documentLink("ARCHITECTURE.md", project.title) })
            .click()

        await expect(page.getByRole("heading", { level: 2, name: "ARCHITECTURE.md" })).toBeVisible()
        await expect(page.getByRole("main").getByRole("status")).toHaveText(texts.loading)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.title)

        gate.resolve()

        await expect(page.getByRole("heading", { level: 3, name: "Visão geral" })).toBeVisible()
        await expect(page.getByRole("main").getByRole("status")).toHaveCount(0)
    })
})

test.describe("relacionados", () => {
    test("RF-PROJECT-28, RF-PROJECT-19, RF-PROJECT-33: MNIST e Player Profile Clustering mostram um ao outro, sem texto de motivo, e o destino foca o h1", async ({
        page
    }) => {
        const mnist = await openProject(page, "pt-BR", MNIST)
        const player = readProjectDetail("pt-BR", PLAYER)
        const texts = PROJECT_TEXTS["pt-BR"]
        const main = page.getByRole("main")
        await expect(
            main.getByRole("heading", { level: 2, name: texts.relatedHeading })
        ).toBeVisible()
        await expect(main.getByRole("link", { name: texts.viewAll })).toHaveAttribute(
            "href",
            `${FATEC_BASE_PATH}pt-BR/projects`
        )
        await expect(main.getByText(OLD_REASON_MARKER)).toHaveCount(0)
        await expect(main.getByRole("article")).toHaveCount(1)
        await expect(main.getByRole("article").getByRole("heading", { level: 3 })).toContainText(
            player.title
        )

        await main.getByRole("article").getByRole("link", { name: player.title }).click()

        await expect(page).toHaveURL(new RegExp(`/projects/${player.id}$`))
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(player.title)
        await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
        await expect(main.getByText(OLD_REASON_MARKER)).toHaveCount(0)

        await main.getByRole("article").getByRole("link", { name: mnist.title }).click()

        await expect(page).toHaveURL(new RegExp(`/projects/${mnist.id}$`))
        await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
    })

    test("RF-PROJECT-33: os outros quatro projetos do conteúdo não mostram a seção", async ({
        page
    }) => {
        const titles = ["Maps", "Pedido de Namoro Irrecusável", "Controle de Despesas"]

        for (const title of titles) {
            await openProject(page, "pt-BR", title)

            await expect(
                page.getByRole("heading", { level: 2, name: PROJECT_TEXTS["pt-BR"].relatedHeading })
            ).toHaveCount(0)
        }
        await openProject(page, "pt-BR", "Conversor de Unidades")
        await expect(
            page.getByRole("heading", { level: 2, name: PROJECT_TEXTS["pt-BR"].relatedHeading })
        ).toHaveCount(0)
    })

    test("RF-PROJECT-28: com três relacionados a seção mostra três cards em lista, só com o card de cada um e sem motivo", async ({
        page
    }) => {
        const mnist = readProjectDetail("pt-BR", MNIST)
        await page.goto(NOT_FOUND_PROBE)
        await page.getByRole("heading", { level: 1 }).waitFor()
        const fixture = await serveProjectFixture(page, {
            language: "pt-BR",
            projectId: mnist.id,
            imageCount: 1,
            relatedCount: 3
        })
        await navigateClientSide(page, projectPath("pt-BR", mnist.id))

        const cards = page.getByRole("main").getByRole("article")

        await expect(cards).toHaveCount(3)
        for (const item of fixture.related) {
            const title = String(
                readRawProjects("pt-BR").find((candidate) => candidate.id === item.id)?.title
            )
            const link = cards.getByRole("link", { name: title })
            await expect(link).toBeVisible()
            await expect(link).toHaveAttribute(
                "href",
                `${FATEC_BASE_PATH}pt-BR/projects/${item.id}`
            )
        }
        await expect(page.getByText(OLD_REASON_MARKER)).toHaveCount(0)
        await expect(page.getByText(/^Motivo /)).toHaveCount(0)
        await expect(
            page.getByRole("main").getByRole("list").last().getByRole("listitem")
        ).toHaveCount(3)
    })
})

test.describe("links e layout", () => {
    for (const language of LANGUAGES) {
        test(`RF-PROJECT-14, A11Y-G08: em ${language} os links externos têm nome completo, nova aba e alvo de 44px`, async ({
            page
        }) => {
            const project = await openProject(page, language, WITH_DEMO)
            const texts = PROJECT_TEXTS[language]
            expect(project.demoUrl).toBeDefined()
            expect(project.repositoryUrl).toBeDefined()

            const demo = page.getByRole("link", { name: texts.demoName(project.title) })
            const code = page.getByRole("link", { name: texts.codeName(project.title) })

            await expect(demo).toHaveAttribute("href", project.demoUrl ?? "")
            await expect(code).toHaveAttribute("href", project.repositoryUrl ?? "")
            for (const link of [demo, code]) {
                await expect(link).toHaveAttribute("target", "_blank")
                await expect(link).toHaveAttribute("rel", "noopener noreferrer")
                await expect(link).toContainText("↗")
                const box = await link.boundingBox()
                expect(box?.height ?? 0).toBeGreaterThanOrEqual(TOUCH_TARGET)
            }
        })
    }

    test("RF-PROJECT-14: sem demonstração só o link do repositório aparece", async ({ page }) => {
        const project = await openProject(page, "pt-BR", MNIST)
        const texts = PROJECT_TEXTS["pt-BR"]

        await expect(page.getByRole("link", { name: texts.codeName(project.title) })).toBeVisible()
        await expect(page.getByRole("link", { name: texts.demo })).toHaveCount(0)
    })

    test("RF-PROJECT-03: a partir de 980px o aside fica fixo ao rolar e a ordem é galeria, documentação em duas colunas", async ({
        page
    }) => {
        test.skip(!isWide(page), "só em duas colunas")
        await openProject(page, "pt-BR", MNIST)
        const facts = page.getByRole("heading", {
            level: 2,
            name: PROJECT_TEXTS["pt-BR"].factsHeading
        })
        const gallery = page.getByRole("region", { name: PROJECT_TEXTS["pt-BR"].gallery })
        const documentBody = page
            .getByRole("heading", { level: 2, name: "README.md" })
            .locator("xpath=following-sibling::div[1]")
        const factsBefore = await facts.boundingBox()
        const galleryBox = await gallery.boundingBox()
        const documentBox = await documentBody.boundingBox()
        expect(factsBefore?.x ?? 0).toBeGreaterThan((galleryBox?.x ?? 0) + (galleryBox?.width ?? 0))
        expect(documentBox?.x ?? 0).toBeLessThan(factsBefore?.x ?? 0)

        await page.evaluate(() => window.scrollTo(0, 500))
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(500)

        const factsAfter = await facts.boundingBox()
        expect(Math.abs((factsAfter?.y ?? 0) - (factsBefore?.y ?? 0) + 500)).toBeGreaterThan(100)
        expect(factsAfter?.y ?? 0).toBeGreaterThan(0)
        expect(factsAfter?.y ?? 0).toBeLessThan(300)
    })

    test("RF-PROJECT-03: abaixo de 980px a ordem é galeria, ficha técnica, documentação", async ({
        page
    }) => {
        test.skip(isWide(page), "só em uma coluna")
        await openProject(page, "pt-BR", MNIST)
        const gallery = await page
            .getByRole("region", { name: PROJECT_TEXTS["pt-BR"].gallery })
            .boundingBox()
        const facts = await page
            .getByRole("heading", { level: 2, name: PROJECT_TEXTS["pt-BR"].factsHeading })
            .boundingBox()
        const documentBody = await page
            .getByRole("heading", { level: 2, name: "README.md" })
            .locator("xpath=following-sibling::div[1]")
            .boundingBox()

        expect(facts?.y ?? 0).toBeGreaterThan(gallery?.y ?? 0)
        expect(documentBody?.y ?? 0).toBeGreaterThan(facts?.y ?? 0)
        expect(Math.abs((facts?.x ?? 0) - (gallery?.x ?? 0))).toBeLessThan(40)
    })

    test("NF-RE-03, A11Y-G11: a 320px o projeto, um documento com código e a LICENSE não rolam na horizontal", async ({
        page
    }) => {
        await page.setViewportSize({ width: 320, height: 700 })
        const mnist = readProjectDetail("pt-BR", MNIST)

        for (const documentName of [undefined, "SETUP.md", "LICENSE"]) {
            await page.goto(projectPath("pt-BR", mnist.id, documentName))
            await page.getByRole("heading", { level: 1 }).waitFor()

            const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth - document.documentElement.clientWidth
            )
            expect(overflow).toBeLessThanOrEqual(0)
        }
    })
})
