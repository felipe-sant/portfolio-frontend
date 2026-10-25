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
import type ProjectRecord from "@/types/project/ProjectRecord.types"

const SITE_URL = "http://localhost:5173"
const LANGUAGES = ["pt-BR", "en", "es"] as const

function LocationDisplay() {
    const location = useLocation()

    return <span data-testid="location">{`${location.pathname}${location.search}`}</span>
}

function filesFor(records: ProjectRecord[]) {
    const files: Record<string, unknown> = {}

    for (const language of LANGUAGES) {
        files[`content/${language}/projects.json`] = { items: records }
        files[`content/${language}/profile.json`] = buildProfile()
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
        expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
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

    it("ordena no DOM título, introdução, busca e ordenação, filtros, contagem, grade e carregar mais", async () => {
        stubProjects(10)

        renderPage()
        await listLoaded()

        const ordered = [
            screen.getByRole("heading", { level: 1 }),
            screen.getByText(/Tudo o que construí/),
            screen.getByRole("searchbox"),
            screen.getByRole("combobox", { name: "Ordenar" }),
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
            ).toBeTruthy()
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

    it("ordena por A–Z sem ligar Limpar filtros", async () => {
        stubProjects(10)
        const user = userEvent.setup()
        renderPage()
        await listLoaded()
        const select = screen.getByRole("combobox", { name: "Ordenar" })

        expect(
            within(select)
                .getAllByRole("option")
                .map((option) => option.textContent)
        ).toEqual(["Mais recente", "Mais antigo", "A–Z"])

        await user.selectOptions(select, "A–Z")

        await waitFor(() => expect(currentLocation()).toBe("/pt-BR/projects?sort=title"))
        await waitFor(() => expect(cards()[0]).toHaveTextContent("Projeto 1"))
        expect(screen.queryByRole("button", { name: "Limpar filtros" })).not.toBeInTheDocument()
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
        expect(screen.getByRole("combobox", { name: "Ordenar" })).toHaveValue("title")
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

        await screen.findByRole("heading", { level: 1, name: "Projetos" })
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
    })

    it("mantém a query ao trocar de idioma pelo seletor e abre no primeiro lote", async () => {
        stubProjects(20)
        const user = userEvent.setup()
        const { router } = renderRoutes("/pt-BR/projects?type=web")
        await waitFor(() => expect(cards().length).toBeGreaterThan(0))
        await user.click(screen.getByRole("button", { name: "Carregar mais" }))
        await waitFor(() => expect(cards()).toHaveLength(10))

        await user.click(screen.getAllByRole("button", { name: "Idioma: Português" })[0])
        const link = screen.getByRole("link", { name: "English" })
        expect(link).toHaveAttribute("href", "/en/projects?type=web")
        await user.click(link)

        await waitFor(() => expect(router.state.location.pathname).toBe("/en/projects"))
        expect(router.state.location.search).toBe("?type=web")
        await screen.findByRole("heading", { level: 1, name: "Projects" })
        await waitFor(() => expect(cards()).toHaveLength(9))
    })

    it("publica o JSON-LD CollectionPage com todos os projetos, igual com ou sem query", async () => {
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
        expect(plain.mainEntity.itemListElement).toHaveLength(20)
        expect(plain.mainEntity.itemListElement[0]).toEqual({
            "@type": "ListItem",
            position: 1,
            url: `${SITE_URL}/pt-BR/projects/0192f1a0-0000-7000-8000-000000000020`,
            name: "Projeto 20"
        })
        expect(plain.mainEntity.itemListElement[19].position).toBe(20)
        expect(readJsonLd()).toEqual(plain)
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
            "Ordenar",
            "Tipo",
            "Todos",
            "Categoria",
            "Carregar mais",
            "9 de 10 projetos"
        ],
        [
            "en",
            "Search projects",
            "Sort",
            "Type",
            "All",
            "Category",
            "Load more",
            "9 of 10 projects"
        ],
        [
            "es",
            "Buscar proyecto",
            "Ordenar",
            "Tipo",
            "Todos",
            "Categoría",
            "Cargar más",
            "9 de 10 proyectos"
        ]
    ] as const)(
        "mostra os textos em %s sem chave no lugar do texto",
        async (language, search, sort, type, all, category, more, count) => {
            stubProjects(10)
            await setLanguage(language)

            renderPage(`/${language}/projects`)
            await listLoaded()

            expect(screen.getByRole("searchbox", { name: search })).toBeVisible()
            expect(screen.getByRole("combobox", { name: sort })).toBeVisible()
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
            stubProjects(10)
            await setLanguage(language)
            const first = renderPage(`/${language}/projects?type=iot`)

            expect(await screen.findByRole("heading", { name: noResults })).toBeVisible()
            expect(screen.getByRole("button", { name: clear })).toBeVisible()
            first.unmount()

            stubContentFetch({})
            renderPage(`/${language}/projects`)

            expect(await screen.findByText(error)).toBeVisible()
        }
    )

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
