import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMemoryRouter, MemoryRouter, RouterProvider, useLocation } from "react-router-dom"
import userEvent from "@testing-library/user-event"
import { act, screen, waitFor, within } from "@testing-library/react"
import setLanguage from "@/i18n/setLanguage"
import ProjectsPage from "@/pages/Projects.page"
import routes from "@/routers/routes"
import buildProfile from "@/testUtils/buildProfile"
import buildProjectRecords from "@/testUtils/buildProjectRecords"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import failFetchAfter from "@/testUtils/failFetchAfter"
import holdFetchAfter from "@/testUtils/holdFetchAfter"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type Profile from "@/types/profile/Profile.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

const SITE_URL = "http://localhost:5173"
const LANGUAGES = ["pt-BR", "en", "es"] as const

function LocationDisplay() {
    const location = useLocation()

    return <span data-testid="location">{`${location.pathname}${location.search}`}</span>
}

function filesFor(records: ProjectRecord[], profile: Profile = buildProfile()) {
    const files: Record<string, unknown> = {}

    for (const language of LANGUAGES) {
        files[`content/${language}/projects.json`] = { items: records }
        files[`content/${language}/profile.json`] = profile
    }

    return files
}

function stubProjects(count: number) {
    return stubContentFetch(filesFor(buildProjectRecords(count)))
}

function renderPage(entry = "/pt-BR/projects") {
    return renderWithStore(
        <MemoryRouter initialEntries={[entry]}>
            <ProjectsPage />
            <LocationDisplay />
        </MemoryRouter>
    )
}

function renderRoutes(entry: string) {
    const router = createMemoryRouter(routes, { initialEntries: [entry] })

    return { router, ...renderWithStore(<RouterProvider router={router} />) }
}

function currentLocation() {
    return screen.getByTestId("location").textContent
}

async function listLoaded() {
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/\d/))
}

function readJsonLd() {
    const script = document.querySelector('script[type="application/ld+json"]')

    return JSON.parse(script?.textContent ?? "null")
}

function hiddenItemsOf(card: HTMLElement) {
    return card.closest("ul")?.querySelectorAll(':scope > li[aria-hidden="true"]') ?? []
}

function cards() {
    return screen.getAllByRole("heading", { level: 2 })
}

beforeEach(() => {
    window.history.pushState({}, "", "/")
})

afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

describe("ProjectsPage", () => {
    it("mostra só o título, a introdução e o aviso de nenhum projeto publicado quando o conteúdo é vazio", async () => {
        stubProjects(0)

        renderPage()

        expect(
            await screen.findByRole("heading", { name: "Nenhum projeto publicado" })
        ).toBeVisible()
        expect(screen.getByRole("heading", { level: 1, name: "Projetos" })).toBeVisible()
        expect(
            screen.getByText(
                "Tudo o que construí e posso mostrar: trabalho profissional, projetos da faculdade e o que fiz por conta própria."
            )
        ).toBeVisible()
        expect(
            screen.getByText("Os projetos aparecem aqui assim que eu publicar o primeiro.")
        ).toBeVisible()
        expect(screen.queryByRole("searchbox")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: /^Ordenar/ })).not.toBeInTheDocument()
        expect(screen.queryByRole("group")).not.toBeInTheDocument()
        expect(screen.queryByRole("status")).not.toBeInTheDocument()
    })

    it.each([
        [
            "pt-BR",
            "Projetos · Luiz Felipe dos Santos",
            "Projetos de Luiz Felipe dos Santos, com busca por tipo, categoria e tecnologia."
        ],
        [
            "en",
            "Projects · Luiz Felipe dos Santos",
            "Projects by Luiz Felipe dos Santos, with search by type, category and technology."
        ],
        [
            "es",
            "Proyectos · Luiz Felipe dos Santos",
            "Proyectos de Luiz Felipe dos Santos, con búsqueda por tipo, categoría y tecnología."
        ]
    ] as const)(
        "tem um h1 e o mesmo título e descrição com ou sem query em %s",
        async (language, title, description) => {
            stubProjects(10)
            await setLanguage(language)

            const { unmount } = renderPage(`/${language}/projects`)
            await listLoaded()

            expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
            expect(screen.queryByRole("main")).not.toBeInTheDocument()
            expect(document.title).toBe(title)
            expect(
                document.querySelector('meta[name="description"]')?.getAttribute("content")
            ).toBe(description)
            unmount()

            renderPage(`/${language}/projects?type=web&q=projeto`)
            await listLoaded()

            expect(document.title).toBe(title)
            expect(
                document.querySelector('meta[name="description"]')?.getAttribute("content")
            ).toBe(description)
        }
    )

    it("ordena no DOM título, introdução, busca, botão Filtros, filtros, contagem, grade e carregar mais", async () => {
        stubProjects(10)

        renderPage()
        await listLoaded()

        const ordered = [
            screen.getByRole("heading", { level: 1 }),
            screen.getByText(/Tudo o que construí/),
            screen.getByRole("searchbox"),
            screen.getByRole("button", { name: "Filtros" }),
            screen.getByRole("group", { name: "Tipo" }),
            screen.getByRole("group", { name: "Categoria" }),
            screen.getByRole("status"),
            cards()[0],
            screen.getByRole("button", { name: "Carregar mais" })
        ]

        ordered.slice(1).forEach((element, index) => {
            const previous = ordered[index]
            expect(
                previous.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING
            ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
        })
        const headings = screen.getAllByRole("heading")
        expect(headings.map((heading) => heading.tagName)).toEqual([
            "H1",
            ...Array.from({ length: 9 }, () => "H2")
        ])
    })

    it("tem o campo de busca com rótulo, placeholder e limite de 100 caracteres", async () => {
        stubProjects(10)

        const { container } = renderPage()
        await listLoaded()
        const field = screen.getByRole("searchbox", { name: "Buscar projeto" })

        expect(field).toHaveAttribute("type", "search")
        expect(field).toHaveAttribute("placeholder", "Busque por nome ou tecnologia")
        expect(field).toHaveAttribute("maxlength", "100")
        expect(screen.queryByRole("button", { name: "Limpar busca" })).not.toBeInTheDocument()
        expect(container.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
    })

    it("limpa a busca na hora, aplica e devolve o foco ao campo", async () => {
        stubProjects(10)
        const user = userEvent.setup()
        renderPage("/pt-BR/projects?q=projeto")
        await listLoaded()
        const field = screen.getByRole("searchbox", { name: "Buscar projeto" })
        expect(field).toHaveValue("projeto")

        await user.click(screen.getByRole("button", { name: "Limpar busca" }))

        expect(field).toHaveValue("")
        expect(field).toHaveFocus()
        await waitFor(() => expect(currentLocation()).toBe("/pt-BR/projects"))
    })

    it("mostra o termo na hora, aplica depois de 300 ms e ignora o Enter", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true })
        stubProjects(10)
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        renderPage()
        await listLoaded()

        await user.type(screen.getByRole("searchbox"), "projeto 1")
        await user.keyboard("{Enter}")

        expect(screen.getByRole("searchbox")).toHaveValue("projeto 1")
        expect(currentLocation()).toBe("/pt-BR/projects")

        await act(async () => {
            await vi.advanceTimersByTimeAsync(300)
        })

        await waitFor(() => expect(currentLocation()).toBe("/pt-BR/projects?q=projeto+1"))
    })

    it("mostra os grupos Tipo e Categoria com aria-pressed e só os tipos disponíveis", async () => {
        stubProjects(10)
        const user = userEvent.setup()

        renderPage()
        await listLoaded()
        const type = screen.getByRole("group", { name: "Tipo" })
        const category = screen.getByRole("group", { name: "Categoria" })

        expect(
            within(type)
                .getAllByRole("button")
                .map((button) => button.textContent)
        ).toEqual(["Todos", "Web", "API"])
        expect(within(type).getByRole("button", { name: "Todos" })).toHaveAttribute(
            "aria-pressed",
            "true"
        )
        expect(
            within(category)
                .getAllByRole("button")
                .map((button) => button.textContent)
        ).toEqual(["Acadêmicos", "Pessoais", "Profissionais"])

        await user.click(within(type).getByRole("button", { name: "Web" }))

        await waitFor(() =>
            expect(within(type).getByRole("button", { name: "Web" })).toHaveAttribute(
                "aria-pressed",
                "true"
            )
        )
        expect(within(type).getByRole("button", { name: "Todos" })).toHaveAttribute(
            "aria-pressed",
            "false"
        )
    })

    it("não tem controle de ordenação fora do modal", async () => {
        stubProjects(10)
        renderPage()
        await listLoaded()

        expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: /^Ordenar/ })).not.toBeInTheDocument()
        expect(screen.queryByRole("radio")).not.toBeInTheDocument()
    })

    it("ordena por A–Z pelo modal sem ligar Limpar filtros nem o contador e devolve o foco ao botão", async () => {
        stubProjects(10)
        const user = userEvent.setup()
        renderPage()
        await listLoaded()
        await user.click(screen.getByRole("button", { name: "Filtros" }))

        expect(
            within(screen.getByRole("group", { name: "Ordenar" }))
                .getAllByRole("radio")
                .map((radio) => radio.closest("label")?.textContent)
        ).toEqual(["Mais recente", "Mais antigo", "A–Z"])

        await user.click(screen.getByRole("radio", { name: "A–Z" }))
        await user.click(screen.getByRole("button", { name: "Aplicar" }))

        await waitFor(() => expect(currentLocation()).toBe("/pt-BR/projects?sort=title"))
        await waitFor(() => expect(cards()[0]).toHaveTextContent("Projeto 1"))
        expect(screen.queryByRole("button", { name: "Limpar filtros" })).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Filtros" })).toHaveFocus()
    })

    it("anuncia a contagem numa região de status que existe desde o início", async () => {
        const fetchMock = stubProjects(10)
        const release = holdFetchAfter(fetchMock, 0)

        renderPage()
        const status = screen.getByRole("status")

        await waitFor(() => expect(status).toHaveTextContent("Carregando projetos…"))
        await act(async () => {
            release()
        })

        await waitFor(() => expect(status).toHaveTextContent("9 de 10 projetos"))
        expect(screen.getByRole("status")).toBe(status)
    })

    it.each([
        [1, "1 de 1 projeto"],
        [10, "9 de 10 projetos"]
    ])("conta %i projeto(s) como %s", async (count, text) => {
        stubProjects(count)

        renderPage()

        await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(text))
    })

    it("mostra Limpar filtros só com busca, tipo ou categoria e o zera mantendo a ordenação", async () => {
        stubProjects(20)
        const user = userEvent.setup()
        renderPage("/pt-BR/projects?sort=title")
        await listLoaded()
        expect(screen.queryByRole("button", { name: "Limpar filtros" })).not.toBeInTheDocument()

        await user.click(
            within(screen.getByRole("group", { name: "Tipo" })).getByRole("button", { name: "Web" })
        )
        await user.click(screen.getByRole("button", { name: "Carregar mais" }))
        await waitFor(() => expect(cards()).toHaveLength(10))
        await user.click(await screen.findByRole("button", { name: "Limpar filtros" }))

        expect(screen.getByRole("searchbox")).toHaveFocus()
        await waitFor(() => expect(currentLocation()).toBe("/pt-BR/projects?sort=title"))
        await waitFor(() =>
            expect(screen.getByRole("status")).toHaveTextContent("9 de 20 projetos")
        )
        expect(screen.queryByRole("button", { name: "Limpar filtros" })).not.toBeInTheDocument()
    })

    it("mostra a grade como lista com nove cards e Carregar mais, que acrescenta o décimo e foca o novo link", async () => {
        stubProjects(10)
        const user = userEvent.setup()
        const { container } = renderPage()
        await listLoaded()

        expect(container.querySelectorAll("ul > li")).not.toHaveLength(0)
        expect(cards()).toHaveLength(9)

        await user.click(screen.getByRole("button", { name: "Carregar mais" }))

        await waitFor(() => expect(cards()).toHaveLength(10))
        expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Projeto 1" })).toHaveFocus()
        await waitFor(() =>
            expect(screen.getByRole("status")).toHaveTextContent("10 de 10 projetos")
        )
    })

    it("mostra nove esqueletos aria-hidden, controles usáveis e nada de Limpar filtros ou Carregar mais enquanto carrega", async () => {
        const fetchMock = stubProjects(10)
        const release = holdFetchAfter(fetchMock, 0)
        const user = userEvent.setup()

        const { container } = renderPage()

        await waitFor(() =>
            expect(screen.getByRole("status")).toHaveTextContent("Carregando projetos…")
        )
        expect(container.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(9)
        expect(screen.queryAllByRole("heading", { level: 2 })).toHaveLength(0)
        expect(screen.queryByRole("button", { name: "Limpar filtros" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument()
        await user.type(screen.getByRole("searchbox"), "a")
        expect(screen.getByRole("searchbox")).toHaveValue("a")
        await act(async () => {
            release()
        })
        await listLoaded()
    })

    it("mostra Carregar mais ocupado, com esqueletos aria-hidden, sem desabilitar e ignorando o segundo clique", async () => {
        const fetchMock = stubProjects(20)
        const user = userEvent.setup()
        renderPage()
        await listLoaded()
        const release = holdFetchAfter(fetchMock, 0)
        const button = screen.getByRole("button", { name: "Carregar mais" })

        await user.click(button)
        await user.click(button)

        await waitFor(() => expect(button).toHaveAttribute("aria-busy", "true"))
        expect(button).toHaveAttribute("aria-disabled", "true")
        expect(button).not.toBeDisabled()
        expect(button).toHaveFocus()
        expect(hiddenItemsOf(cards()[0])).toHaveLength(9)
        expect(screen.getByRole("status")).toHaveTextContent("9 de 20 projetos")
        await act(async () => {
            release()
        })
        await waitFor(() => expect(cards()).toHaveLength(18))
        expect(vi.mocked(globalThis.fetch).mock.calls).toHaveLength(1)
    })

    it("mostra o alerta de Carregar mais com foco, mantém os cards e some o botão", async () => {
        const fetchMock = stubProjects(20)
        const user = userEvent.setup()
        renderPage()
        await listLoaded()
        const recover = failFetchAfter(fetchMock, 0)

        await user.click(screen.getByRole("button", { name: "Carregar mais" }))

        const alert = await screen.findByRole("alert")
        expect(within(alert).getByText("Não consegui carregar mais projetos")).toBeVisible()
        expect(alert).toHaveFocus()
        expect(cards()).toHaveLength(9)
        expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument()

        recover()
        await user.click(within(alert).getByRole("button", { name: "Tentar novamente" }))

        await waitFor(() => expect(cards()).toHaveLength(18))
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it("mostra o estado sem resultado com o termo como texto e o botão que limpa", async () => {
        stubProjects(10)
        const user = userEvent.setup()
        const { container } = renderPage("/pt-BR/projects?q=%3Cb%3Ex%3C%2Fb%3E")

        const heading = await screen.findByRole("heading", { name: "Nenhum projeto encontrado" })

        expect(heading.tagName).toBe("H2")
        expect(
            screen.getByText(
                "Nenhum resultado para “<b>x</b>”. Tente outro termo ou remova os filtros."
            )
        ).toBeVisible()
        expect(container.querySelector("b")).not.toBeInTheDocument()
        await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("0 projetos"))
        expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument()
        expect(screen.queryAllByRole("link")).toHaveLength(0)
        expect(screen.getAllByRole("button", { name: "Limpar filtros" })).toHaveLength(1)

        await user.click(screen.getByRole("button", { name: "Limpar filtros" }))

        await waitFor(() => expect(currentLocation()).toBe("/pt-BR/projects"))
        await waitFor(() => expect(cards()).toHaveLength(9))
    })

    it("explica a combinação de filtros sem termo de busca", async () => {
        stubProjects(10)

        renderPage("/pt-BR/projects?type=iot")

        expect(
            await screen.findByText("Nenhum projeto com essa combinação de filtros.")
        ).toBeVisible()
    })

    it("mostra o erro com os filtros mantidos, refaz o pedido sem recarregar e foca o título", async () => {
        const fetchMock = stubProjects(10)
        const recover = failFetchAfter(fetchMock, 0)
        const user = userEvent.setup()
        renderPage("/pt-BR/projects?type=web&sort=title")

        const alert = await screen.findByRole("alert")

        expect(within(alert).getByText("Não consegui carregar a lista de projetos")).toBeVisible()
        expect(
            within(alert).getByText(
                "Verifique sua conexão e tente de novo. Seus filtros foram mantidos."
            )
        ).toBeVisible()
        expect(alert).not.toHaveTextContent(/500|Error|fetch/i)
        expect(currentLocation()).toBe("/pt-BR/projects?type=web&sort=title")
        await waitFor(() => expect(screen.getByRole("status")).toBeEmptyDOMElement())

        recover()
        await user.click(within(alert).getByRole("button", { name: "Tentar novamente" }))

        expect(screen.getByRole("heading", { level: 1 })).toHaveFocus()
        await waitFor(() => expect(cards()).toHaveLength(5))
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it.each(LANGUAGES)("mantém o prefixo de %s nos links dos cards", async (language) => {
        stubProjects(10)
        await setLanguage(language)

        renderPage(`/${language}/projects`)
        await listLoaded()

        const links = screen.getAllByRole("link")
        expect(links).toHaveLength(9)
        expect(links[0]).toHaveAttribute(
            "href",
            expect.stringMatching(new RegExp(`^/${language}/projects/0192f1a0-`))
        )
    })

    it("abre a rota já filtrada e ordenada e reescreve a URL por replace", async () => {
        stubProjects(10)
        const user = userEvent.setup()
        const { router } = renderRoutes("/pt-BR/projects?type=web&sort=title")

        await screen.findByRole("heading", { level: 1, name: "Projetos" }, { timeout: 5000 })
        await waitFor(() =>
            expect(cards().map((card) => card.textContent)).toEqual([
                "Projeto 1",
                "Projeto 3",
                "Projeto 5",
                "Projeto 7",
                "Projeto 9"
            ])
        )

        await user.click(screen.getByRole("button", { name: "Acadêmicos" }))

        await waitFor(() =>
            expect(router.state.location.search).toBe("?type=web&category=academic&sort=title")
        )
        expect(router.state.historyAction).toBe("REPLACE")
    }, 20000)

    it("mantém a query ao trocar de idioma pelo seletor e abre no primeiro lote", async () => {
        stubProjects(20)
        const user = userEvent.setup()
        const { router } = renderRoutes("/pt-BR/projects?type=web")
        await waitFor(() => expect(cards().length).toBeGreaterThan(0), { timeout: 5000 })
        await user.click(screen.getByRole("button", { name: "Carregar mais" }))
        await waitFor(() => expect(cards()).toHaveLength(10), { timeout: 5000 })

        await user.click(screen.getAllByRole("button", { name: "Idioma: Português" })[0])
        const link = screen.getByRole("link", { name: "English" })
        expect(link).toHaveAttribute("href", "/en/projects?type=web")
        await user.click(link)

        await waitFor(() => expect(router.state.location.pathname).toBe("/en/projects"))
        expect(router.state.location.search).toBe("?type=web")
        await screen.findByRole("heading", { level: 1, name: "Projects" }, { timeout: 5000 })
        await waitFor(() => expect(cards()).toHaveLength(9), { timeout: 5000 })
    }, 20000)

    it("publica o JSON-LD CollectionPage com os 9 projetos do primeiro lote, sem numberOfItems, com ou sem query", async () => {
        stubProjects(20)

        const { unmount } = renderPage()
        await waitFor(() => expect(readJsonLd()).not.toBeNull())
        const plain = readJsonLd()
        unmount()
        renderPage("/pt-BR/projects?type=web&q=projeto")
        await waitFor(() => expect(readJsonLd()).not.toBeNull())

        expect(plain["@type"]).toBe("CollectionPage")
        expect(plain.name).toBe("Projetos · Luiz Felipe dos Santos")
        expect(plain.url).toBe(`${SITE_URL}/pt-BR/projects`)
        expect(plain.inLanguage).toBe("pt-BR")
        expect(plain.author).toEqual({ "@id": `${SITE_URL}/pt-BR#person` })
        expect(plain.mainEntity["@type"]).toBe("ItemList")
        expect(plain.mainEntity.itemListElement).toHaveLength(9)
        expect(plain.mainEntity).not.toHaveProperty("numberOfItems")
        expect(plain.mainEntity.itemListElement[0]).toEqual({
            "@type": "ListItem",
            position: 1,
            url: `${SITE_URL}/pt-BR/projects/0192f1a0-0000-7000-8000-000000000020`,
            name: "Projeto 20"
        })
        expect(plain.mainEntity.itemListElement[8].position).toBe(9)
        expect(readJsonLd().mainEntity.itemListElement).toHaveLength(9)
        expect(readJsonLd().url).toBe(plain.url)
        expect(readJsonLd().name).toBe(plain.name)
    })

    it("abre só a lista e as opções, sem consulta de índice", async () => {
        stubProjects(10)

        const { store } = renderPage()
        await listLoaded()

        const endpoints = Object.values(store.getState().api.queries).map(
            (entry) => entry?.endpointName
        )
        expect(endpoints).toContain("getProjectsPages")
        expect(endpoints).toContain("getProjectFilterOptions")
        expect(endpoints).not.toContain("getProjectsIndex")
    })

    it("declara a canônica sem query e nenhum noindex com query", async () => {
        stubProjects(10)

        renderPage("/pt-BR/projects?type=web&q=projeto")
        await listLoaded()

        expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
            `${SITE_URL}/pt-BR/projects`
        )
        expect(document.head.querySelector('meta[name="robots"]')).not.toBeInTheDocument()
    })

    it.each([
        [
            "pt-BR",
            "Buscar projeto",
            "Tipo",
            "Todos",
            "Categoria",
            "Carregar mais",
            "9 de 10 projetos"
        ],
        ["en", "Search projects", "Type", "All", "Category", "Load more", "9 of 10 projects"],
        ["es", "Buscar proyecto", "Tipo", "Todos", "Categoría", "Cargar más", "9 de 10 proyectos"]
    ] as const)(
        "mostra os textos em %s sem chave no lugar do texto",
        async (language, search, type, all, category, more, count) => {
            stubProjects(10)
            await setLanguage(language)

            renderPage(`/${language}/projects`)
            await listLoaded()

            expect(screen.getByRole("searchbox", { name: search })).toBeVisible()
            expect(screen.getByRole("group", { name: type })).toBeVisible()
            expect(screen.getByRole("button", { name: all })).toBeVisible()
            expect(screen.getByRole("group", { name: category })).toBeVisible()
            expect(screen.getByRole("button", { name: more })).toBeVisible()
            expect(screen.getByRole("status")).toHaveTextContent(count)
            expect(document.body.textContent).not.toMatch(
                /\b(results|filters|noResults|loadMore|search|sort|empty)\.[a-zA-Z]+/
            )
        }
    )

    it.each([
        ["pt-BR", "Filtros", "Ordenar", ["Mais recente", "Mais antigo", "A–Z"]],
        ["en", "Filters", "Sort", ["Most recent", "Oldest", "A–Z"]],
        ["es", "Filtros", "Ordenar", ["Más reciente", "Más antiguo", "A–Z"]]
    ] as const)(
        "mostra a seção de ordenação do modal em %s sem chave no lugar do texto",
        async (language, open, legend, labels) => {
            stubProjects(10)
            await setLanguage(language)
            const user = userEvent.setup()
            renderPage(`/${language}/projects`)
            await listLoaded()

            await user.click(screen.getByRole("button", { name: open }))

            expect(
                within(screen.getByRole("group", { name: legend }))
                    .getAllByRole("radio")
                    .map((radio) => radio.closest("label")?.textContent)
            ).toEqual(labels)
            expect(document.body.textContent).not.toMatch(/\bsort\.[a-zA-Z]+/)
        }
    )

    it.each([
        [
            "pt-BR",
            "Nenhum projeto encontrado",
            "Não consegui carregar a lista de projetos",
            "Limpar filtros"
        ],
        ["en", "No projects found", "I couldn't load the list of projects", "Clear filters"],
        [
            "es",
            "Ningún proyecto encontrado",
            "No pude cargar la lista de proyectos",
            "Limpiar filtros"
        ]
    ] as const)(
        "mostra os textos de sem resultado e de erro em %s",
        async (language, noResults, error, clear) => {
            const fetchMock = stubProjects(10)
            await setLanguage(language)
            const first = renderPage(`/${language}/projects?type=iot`)

            expect(await screen.findByRole("heading", { name: noResults })).toBeVisible()
            expect(screen.getByRole("button", { name: clear })).toBeVisible()
            first.unmount()

            failFetchAfter(fetchMock, 0)
            renderPage(`/${language}/projects`)

            expect(await screen.findByText(error)).toBeVisible()
        }
    )

    it("abre sem filtro com um pedido de projects.json e um de profile.json", async () => {
        const fetchMock = stubProjects(10)
        renderRoutes("/pt-BR/projects")

        const requested = (file: string) =>
            fetchMock.mock.calls.filter(([url]) => String(url).includes(file))
        await waitFor(() => expect(requested("profile.json")).toHaveLength(1))
        await screen.findByRole("button", { name: "Carregar mais" })
        expect(requested("projects.json")).toHaveLength(1)
        expect(requested("profile.json")).toHaveLength(1)
    })

    it("não tem violações de acessibilidade carregando", async () => {
        const fetchMock = stubProjects(10)
        const release = holdFetchAfter(fetchMock, 0)
        const { container } = renderPage()
        await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Carregando"))

        await expectNoAxeViolations(container)
        await act(async () => {
            release()
        })
    }, 15000)

    it("não tem violações de acessibilidade com a lista", async () => {
        stubProjects(10)
        const { container } = renderPage()
        await listLoaded()

        await expectNoAxeViolations(container)
    }, 15000)

    it("não tem violações de acessibilidade carregando mais", async () => {
        const fetchMock = stubProjects(20)
        const user = userEvent.setup()
        const { container } = renderPage()
        await listLoaded()
        const release = holdFetchAfter(fetchMock, 0)
        await user.click(screen.getByRole("button", { name: "Carregar mais" }))
        await waitFor(() =>
            expect(screen.getByRole("button", { name: "Carregar mais" })).toHaveAttribute(
                "aria-busy",
                "true"
            )
        )

        await expectNoAxeViolations(container)
        await act(async () => {
            release()
        })
    }, 15000)

    it("não tem violações de acessibilidade com erro", async () => {
        stubContentFetch({})
        const { container } = renderPage()
        await screen.findByRole("alert")

        await expectNoAxeViolations(container)
    }, 15000)

    it("não tem violações de acessibilidade sem resultado", async () => {
        stubProjects(10)
        const { container } = renderPage("/pt-BR/projects?type=iot")
        await screen.findByRole("heading", { name: "Nenhum projeto encontrado" })

        await expectNoAxeViolations(container)
    }, 15000)

    it("não tem violações de acessibilidade com o conteúdo vazio", async () => {
        stubProjects(0)
        const { container } = renderPage()
        await screen.findByRole("heading", { name: "Nenhum projeto publicado" })

        await expectNoAxeViolations(container)
    }, 15000)
})

const FILTER_STACKS = [
    ["React", "Node.js"],
    ["React"],
    ["Node.js"],
    ["React", "Node.js", "Prisma"],
    ["Prisma"],
    ["React"]
]
const FILTER_DATES = ["2024-01", "2024-06", "2025-01", "2025-06", "2026-01", "2026-06"]

function filterRecords() {
    return buildProjectRecords(6, (index) => ({
        date: FILTER_DATES[index],
        stack: [
            {
                category: "frontend",
                items: FILTER_STACKS[index].map((name) => ({ name }))
            }
        ]
    }))
}

function profileWithStack(...names: string[]) {
    return buildProfile({
        stack: [{ category: "frontend", items: names.map((name) => ({ name })) }]
    })
}

function stubFilterProjects(profile: Profile = profileWithStack("React", "Node.js", "Prisma")) {
    return stubContentFetch(filesFor(filterRecords(), profile))
}

function renderPageWithRouter(entry: string) {
    const router = createMemoryRouter([{ path: "/:lang/projects", element: <ProjectsPage /> }], {
        initialEntries: [entry]
    })

    return { router, ...renderWithStore(<RouterProvider router={router} />) }
}

function filtersButton(name: string | RegExp = /^Filtros/) {
    return screen.getByRole("button", { name })
}

function projectTitles() {
    return cards().map((card) => card.textContent)
}

async function checkOptions(user: ReturnType<typeof userEvent.setup>, names: string[]) {
    for (const name of names) {
        await user.click(screen.getByRole("checkbox", { name }))
    }
}

describe("ProjectsPage, filtros por tecnologia e ano", () => {
    it("não mostra o botão Filtros nem o modal quando o conteúdo é vazio", async () => {
        stubProjects(0)

        renderPage()

        await screen.findByText("Os projetos aparecem aqui assim que eu publicar o primeiro.")
        expect(screen.queryByRole("button", { name: /^Filtros/ })).not.toBeInTheDocument()
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("mostra o botão depois da busca, com popup de diálogo e o contador só de tecnologia e ano", async () => {
        stubFilterProjects()

        const { unmount } = renderPage()
        await listLoaded()
        const button = filtersButton("Filtros")

        expect(button).toHaveAttribute("aria-haspopup", "dialog")
        expect(button).toHaveAttribute("aria-expanded", "false")
        expect(button).not.toHaveAttribute("aria-disabled")
        expect(
            screen.getByRole("searchbox").compareDocumentPosition(button) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
        unmount()

        const withCount = renderPage("/pt-BR/projects?tech=React&year=2025&year=2024")
        await listLoaded()
        expect(filtersButton("Filtros (3)")).toBeVisible()
        withCount.unmount()

        renderPage("/pt-BR/projects?type=web&category=academic&q=projeto")
        await listLoaded()
        expect(filtersButton("Filtros")).toBeVisible()
    })

    it("não tem aria-disabled enquanto carrega pela primeira vez e abre o modal só com Ordenar", async () => {
        const fetchMock = stubFilterProjects()
        const release = holdFetchAfter(fetchMock, 0)
        const user = userEvent.setup()
        renderPage("/pt-BR/projects?tech=React")

        const button = filtersButton("Filtros (1)")
        expect(button).not.toHaveAttribute("aria-disabled")
        await user.click(button)

        expect(screen.getByRole("dialog", { name: "Filtros" })).toBeVisible()
        expect(filtersButton("Filtros (1)")).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByRole("group", { name: "Ordenar" })).toBeVisible()
        expect(screen.queryByRole("group", { name: "Tecnologia" })).not.toBeInTheDocument()
        expect(screen.queryByRole("group", { name: "Ano" })).not.toBeInTheDocument()
        await act(async () => {
            release()
        })
    })

    it("no erro de carga o botão abre o modal e a ordenação escolhida vai para a URL", async () => {
        const fetchMock = stubFilterProjects()
        failFetchAfter(fetchMock, 0)
        const user = userEvent.setup()
        const { router } = renderPageWithRouter("/pt-BR/projects")

        await screen.findByRole("alert")
        const button = filtersButton("Filtros")
        expect(button).not.toHaveAttribute("aria-disabled")
        await user.click(button)
        await user.click(screen.getByRole("radio", { name: "A–Z" }))
        await user.click(screen.getByRole("button", { name: "Aplicar" }))

        await waitFor(() => expect(router.state.location.search).toBe("?sort=title"))
        expect(await screen.findByRole("alert")).toBeVisible()
        expect(screen.getByRole("searchbox")).toBeVisible()
    })

    it("as seções Tecnologia e Ano entram quando os dados chegam e a ordenação do rascunho não se perde", async () => {
        const fetchMock = stubFilterProjects()
        const release = holdFetchAfter(fetchMock, 0)
        const user = userEvent.setup()
        renderPage()

        await user.click(filtersButton("Filtros"))
        await user.click(screen.getByRole("radio", { name: "Mais antigo" }))
        expect(screen.queryByRole("group", { name: "Tecnologia" })).not.toBeInTheDocument()
        await act(async () => {
            release()
        })

        expect(await screen.findByRole("group", { name: "Tecnologia" })).toBeVisible()
        expect(screen.getByRole("group", { name: "Ano" })).toBeVisible()
        expect(screen.getByRole("radio", { name: "Mais antigo" })).toBeChecked()
    })

    it("abre o modal com as tecnologias e os anos dos dados, iguais com e sem filtros aplicados", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        renderPage("/pt-BR/projects?tech=Prisma&year=2026")
        await listLoaded()

        await user.click(filtersButton("Filtros (2)"))

        const dialog = screen.getByRole("dialog", { name: "Filtros" })
        expect(filtersButton("Filtros (2)")).toHaveAttribute("aria-expanded", "true")
        expect(
            within(within(dialog).getByRole("group", { name: "Tecnologia" }))
                .getAllByRole("checkbox")
                .map((box) => box.closest("label")?.textContent)
        ).toEqual(["Node.js", "Prisma", "React"])
        expect(
            within(within(dialog).getByRole("group", { name: "Ano" }))
                .getAllByRole("checkbox")
                .map((box) => box.closest("label")?.textContent)
        ).toEqual(["2026", "2025", "2024"])
        expect(screen.getByRole("checkbox", { name: "Prisma" })).toBeChecked()
        expect(screen.getByRole("checkbox", { name: "2026" })).toBeChecked()
    })

    it("Aplicar escreve tech por replace, mostra só os projetos com todas, anuncia o total e devolve o foco ao botão", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        const { router } = renderPageWithRouter("/pt-BR/projects")
        await listLoaded()

        await user.click(filtersButton("Filtros"))
        await checkOptions(user, ["React", "Node.js"])
        await user.click(screen.getByRole("button", { name: "Aplicar" }))

        await waitFor(() => expect(router.state.location.search).toBe("?tech=Node.js&tech=React"))
        expect(router.state.historyAction).toBe("REPLACE")
        await waitFor(() => expect(projectTitles()).toEqual(["Projeto 4", "Projeto 1"]))
        await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("2 de 2 projetos"))
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        expect(filtersButton("Filtros (2)")).toHaveFocus()
    })

    it("fechar por Esc aplica dois anos por ou", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        const { router } = renderPageWithRouter("/pt-BR/projects")
        await listLoaded()

        await user.click(filtersButton("Filtros"))
        await checkOptions(user, ["2025", "2024"])
        await user.keyboard("{Escape}")

        await waitFor(() => expect(router.state.location.search).toBe("?year=2024&year=2025"))
        await waitFor(() =>
            expect(projectTitles()).toEqual(["Projeto 4", "Projeto 3", "Projeto 2", "Projeto 1"])
        )
    })

    it("abrir e fechar sem mexer não escreve a URL", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        const { router } = renderPageWithRouter("/pt-BR/projects?tech=React")
        await listLoaded()

        await user.click(filtersButton("Filtros (1)"))
        await user.click(screen.getByRole("button", { name: "Fechar" }))

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        expect(router.state.historyAction).toBe("POP")
        expect(router.state.location.search).toBe("?tech=React")
    })

    it("mantém q, type e sort e escreve tech e year na ordem da URL", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        const { router } = renderPageWithRouter("/pt-BR/projects?q=react&type=web&sort=title")
        await listLoaded()

        await user.click(filtersButton("Filtros"))
        await checkOptions(user, ["Node.js", "2024"])
        await user.click(screen.getByRole("button", { name: "Aplicar" }))

        await waitFor(() =>
            expect(router.state.location.search).toBe(
                "?q=react&type=web&tech=Node.js&year=2024&sort=title"
            )
        )
    })

    it("Limpar filtros da tela zera tecnologia e ano, mantém a ordenação e foca a busca", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        const { router } = renderPageWithRouter("/pt-BR/projects?tech=React&sort=oldest")
        await listLoaded()

        await user.click(screen.getByRole("button", { name: "Limpar filtros" }))

        await waitFor(() => expect(router.state.location.search).toBe("?sort=oldest"))
        expect(screen.getByRole("searchbox")).toHaveFocus()
        expect(filtersButton("Filtros")).toBeVisible()
    })

    it("com tecnologia inexistente na URL mostra sem resultado, conta o valor, não marca nada e o Limpar filtros remove", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        const { router } = renderPageWithRouter("/pt-BR/projects?tech=Inexistente")

        expect(await screen.findByText("Nenhum projeto encontrado")).toBeVisible()
        expect(screen.getByText("Nenhum projeto com essa combinação de filtros.")).toBeVisible()

        await user.click(filtersButton("Filtros (1)"))
        expect(
            screen
                .getAllByRole("checkbox")
                .filter((box) => box instanceof HTMLInputElement && box.checked)
        ).toHaveLength(0)
        await user.click(screen.getByRole("button", { name: "Fechar" }))

        await user.click(screen.getByRole("button", { name: "Limpar filtros" }))

        await waitFor(() => expect(router.state.location.search).toBe(""))
        await waitFor(() => expect(cards()).toHaveLength(6))
    })

    it("mantém tech e year ao trocar de idioma e abre no primeiro lote", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        const { router } = renderRoutes("/pt-BR/projects?tech=React&year=2025")
        await waitFor(() => expect(cards().length).toBeGreaterThan(0), { timeout: 5000 })

        await user.click(screen.getAllByRole("button", { name: "Idioma: Português" })[0])
        const link = screen.getByRole("link", { name: "English" })
        expect(link).toHaveAttribute("href", "/en/projects?tech=React&year=2025")
        await user.click(link)

        await waitFor(() => expect(router.state.location.pathname).toBe("/en/projects"))
        expect(router.state.location.search).toBe("?tech=React&year=2025")
        await screen.findByRole("button", { name: "Filters (2)" }, { timeout: 5000 })
    }, 20000)

    it.each([
        ["pt-BR", "Filtros", "Tecnologia", "Ano", "Aplicar"],
        ["en", "Filters", "Technology", "Year", "Apply"],
        ["es", "Filtros", "Tecnología", "Año", "Aplicar"]
    ] as const)(
        "mostra o botão e o modal em %s sem chave no lugar do texto",
        async (language, open, technology, year, apply) => {
            stubFilterProjects()
            await setLanguage(language)
            const user = userEvent.setup()
            renderPage(`/${language}/projects`)
            await listLoaded()

            await user.click(filtersButton(open))

            expect(screen.getByRole("dialog", { name: open })).toBeVisible()
            expect(screen.getByRole("group", { name: technology })).toBeVisible()
            expect(screen.getByRole("group", { name: year })).toBeVisible()
            expect(screen.getByRole("button", { name: apply })).toBeVisible()
            expect(document.body.textContent).not.toMatch(/\bfilters\.[a-zA-Z.]+/)
        }
    )

    it("não tem violações de acessibilidade com o modal fechado", async () => {
        stubFilterProjects()
        const { container } = renderPage()
        await listLoaded()

        await expectNoAxeViolations(container)
    }, 15000)

    it("não tem violações de acessibilidade com o modal aberto", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        renderPage()
        await listLoaded()
        await user.click(filtersButton("Filtros"))

        await expectNoAxeViolations(screen.getByRole("dialog").parentElement as HTMLElement)
    }, 15000)
})

describe("ProjectsPage, ordenação dentro do modal", () => {
    it("fechar por Esc aplica a ordenação escolhida", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        const { router } = renderPageWithRouter("/pt-BR/projects")
        await listLoaded()

        await user.click(filtersButton("Filtros"))
        await user.click(screen.getByRole("radio", { name: "Mais antigo" }))
        await user.keyboard("{Escape}")

        await waitFor(() => expect(router.state.location.search).toBe("?sort=oldest"))
        expect(router.state.historyAction).toBe("REPLACE")
        expect(filtersButton("Filtros")).toBeVisible()
    })

    it("abrir e fechar sem mexer na ordenação não escreve a URL", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        const { router } = renderPageWithRouter("/pt-BR/projects?sort=title")
        await listLoaded()

        await user.click(filtersButton("Filtros"))
        await user.click(screen.getByRole("button", { name: "Fechar" }))

        expect(router.state.historyAction).toBe("POP")
        expect(router.state.location.search).toBe("?sort=title")
    })

    it("Limpar e Aplicar tiram sort, tech e year da URL", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        const { router } = renderPageWithRouter("/pt-BR/projects?tech=React&year=2025&sort=title")
        await listLoaded()

        await user.click(filtersButton("Filtros (2)"))
        await user.click(screen.getByRole("button", { name: "Limpar" }))
        await user.click(screen.getByRole("button", { name: "Aplicar" }))

        await waitFor(() => expect(router.state.location.search).toBe(""))
        expect(filtersButton("Filtros")).toBeVisible()
    })

    it("abre direto com sort=title em A–Z, sem contador e com A–Z marcado no modal", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        renderPage("/pt-BR/projects?sort=title")
        await listLoaded()

        expect(projectTitles()).toEqual([...projectTitles()].toSorted())
        expect(filtersButton("Filtros")).toBeVisible()

        await user.click(filtersButton("Filtros"))

        expect(screen.getByRole("radio", { name: "A–Z" })).toBeChecked()
    })

    it("mantém sort ao trocar de idioma", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        const { router } = renderRoutes("/pt-BR/projects?sort=title")
        await waitFor(() => expect(cards().length).toBeGreaterThan(0), { timeout: 5000 })

        await user.click(screen.getAllByRole("button", { name: "Idioma: Português" })[0])
        await user.click(screen.getByRole("link", { name: "English" }))

        await waitFor(() => expect(router.state.location.pathname).toBe("/en/projects"))
        expect(router.state.location.search).toBe("?sort=title")
    }, 20000)

    it("não tem violações de acessibilidade com o modal aberto e a ordenação marcada", async () => {
        stubFilterProjects()
        const user = userEvent.setup()
        renderPage("/pt-BR/projects?sort=oldest")
        await listLoaded()
        await user.click(filtersButton("Filtros"))

        await expectNoAxeViolations(screen.getByRole("dialog").parentElement as HTMLElement)
    }, 15000)
})

function docker() {
    return profileWithStack("React", "Node.js", "Prisma", "Docker")
}

function noop() {}

describe("ProjectsPage, opções do modal por requisição própria", () => {
    it("mostra desabilitada a tecnologia só da stack do perfil, em ordem alfabética, e habilita as dos projetos", async () => {
        stubFilterProjects(docker())
        const user = userEvent.setup()
        renderPage()
        await listLoaded()

        await user.click(filtersButton("Filtros"))

        const group = await screen.findByRole("group", { name: "Tecnologia" })
        expect(
            within(group)
                .getAllByRole("checkbox")
                .map((box) => box.getAttribute("aria-label") ?? box.closest("label")?.textContent)
        ).toEqual(["Docker (nenhum projeto)", "Node.js", "Prisma", "React"])
        expect(
            within(group).getByRole("checkbox", { name: "Docker (nenhum projeto)" })
        ).toBeDisabled()
        expect(within(group).getByRole("checkbox", { name: "React" })).toBeEnabled()
        expect(
            within(screen.getByRole("group", { name: "Ano" }))
                .getAllByRole("checkbox")
                .map((box) => box.closest("label")?.textContent)
        ).toEqual(["2026", "2025", "2024"])
    })

    it("com ?tech=Docker mostra Filtros (1), sem resultado e a opção marcada e habilitada, que se desmarca e sai da URL", async () => {
        stubFilterProjects(docker())
        const user = userEvent.setup()
        const { router } = renderPageWithRouter("/pt-BR/projects?tech=Docker")

        expect(await screen.findByText("Nenhum projeto encontrado")).toBeVisible()
        await user.click(filtersButton("Filtros (1)"))

        const box = await screen.findByRole("checkbox", { name: "Docker" })
        expect(box).toBeChecked()
        expect(box).toBeEnabled()

        await user.click(box)
        await user.click(screen.getByRole("button", { name: "Aplicar" }))

        await waitFor(() => expect(router.state.location.search).toBe(""))
        expect(router.state.historyAction).toBe("REPLACE")
    })

    it("pede as opções uma vez por idioma e de novo ao trocar o idioma", async () => {
        stubFilterProjects(docker())
        const user = userEvent.setup()
        const { store } = renderRoutes("/pt-BR/projects")
        await waitFor(() => expect(cards().length).toBeGreaterThan(0), { timeout: 5000 })

        function optionKeys() {
            return Object.keys(store.getState().api.queries).filter((key) =>
                key.startsWith("getProjectFilterOptions")
            )
        }

        await waitFor(() =>
            expect(optionKeys()).toEqual(['getProjectFilterOptions({"lang":"pt-BR"})'])
        )

        await user.click(screen.getAllByRole("button", { name: "Idioma: Português" })[0])
        await user.click(screen.getByRole("link", { name: "English" }))

        await waitFor(() => expect(optionKeys()).toHaveLength(2), { timeout: 5000 })
        expect(optionKeys()).toContain('getProjectFilterOptions({"lang":"en"})')
    }, 20000)

    it("com a resposta das opções retida o modal abre só com Ordenar, as seções entram depois e a lista não espera", async () => {
        const fetchMock = stubFilterProjects(docker())
        let release = noop
        const gate = new Promise<void>((resolve) => {
            release = resolve
        })
        vi.stubGlobal(
            "fetch",
            vi.fn(async (input: string | URL | Request) => {
                if (String(input).includes("profile.json")) {
                    await gate
                }

                return fetchMock(input)
            })
        )
        const user = userEvent.setup()
        renderPage()
        await listLoaded()

        await user.click(filtersButton("Filtros"))
        await user.click(screen.getByRole("radio", { name: "A–Z" }))
        expect(screen.queryByRole("group", { name: "Tecnologia" })).not.toBeInTheDocument()
        await act(async () => {
            release()
        })

        expect(await screen.findByRole("group", { name: "Tecnologia" })).toBeVisible()
        expect(screen.getByRole("radio", { name: "A–Z" })).toBeChecked()
    })

    it("com as opções falhando não mostra alerta novo, a lista segue e o modal mostra só Ordenar", async () => {
        const files = filesFor(filterRecords())
        delete files["content/pt-BR/profile.json"]
        stubContentFetch(files)
        const user = userEvent.setup()
        renderPage()
        await listLoaded()

        await user.click(filtersButton("Filtros"))

        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
        expect(cards().length).toBeGreaterThan(0)
        expect(screen.getByRole("group", { name: "Ordenar" })).toBeVisible()
        expect(screen.queryByRole("group", { name: "Tecnologia" })).not.toBeInTheDocument()
    })
})
