import { useEffect } from "react"
import { Provider } from "react-redux"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { act, render, waitFor } from "@testing-library/react"
import listProjects from "@/services/content/listProjects"
import useProjects from "@/pages/hooks/useProjects"
import projectsApi from "@/store/api/projects.api"
import createStore from "@/store/createStore"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import buildProjectRecords from "@/testUtils/buildProjectRecords"
import failFetchAfter from "@/testUtils/failFetchAfter"
import holdFetchAfter from "@/testUtils/holdFetchAfter"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

const hydration = vi.hoisted(() => ({ value: true }))

vi.mock("@/hooks/useHasHydrated", () => ({ default: () => hydration.value }))

vi.mock("@/services/content/listProjects", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/content/listProjects")>()

    return { default: vi.fn(original.default) }
})

type ProjectsHook = ReturnType<typeof useProjects>

type RenderSnapshot = { text: string; isLoading: boolean; shown: number }

const PATH = "/pt-BR/projects"
const PROJECTS_FILE = "content/pt-BR/projects.json"

let latest: ProjectsHook
const snapshots: RenderSnapshot[] = []

function Probe() {
    const projects = useProjects()
    const { gridRef } = projects

    useEffect(() => {
        latest = projects
    })

    snapshots.push({
        text: projects.resultsText,
        isLoading: projects.isLoading,
        shown: projects.shown
    })

    return (
        <>
            <h1 id={projects.ids.heading} tabIndex={-1}>
                Projetos
            </h1>
            <ul ref={gridRef}>
                {projects.items.map((item) => (
                    <li key={item.id}>
                        <a href={`#${item.id}`}>{item.title}</a>
                    </li>
                ))}
            </ul>
            {projects.loadMoreError && <div id={projects.ids.loadMoreAlert} tabIndex={-1} />}
        </>
    )
}

function mount(
    entry: string | { pathname: string; search?: string; state?: unknown } = PATH,
    store = createStore()
) {
    const router = createMemoryRouter([{ path: "/:lang/projects", element: <Probe /> }], {
        initialEntries: [entry]
    })
    const view = render(
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    )

    return { router, store, ...view }
}

function stubProjects(records: ProjectRecord[]) {
    return stubContentFetch({ [PROJECTS_FILE]: { items: records } })
}

function projectRequests(fetchMock: ReturnType<typeof stubContentFetch>) {
    return fetchMock.mock.calls.filter(([url]) => String(url).includes("projects.json")).length
}

async function settled() {
    await waitFor(() => expect(latest.isLoading).toBe(false))
}

function dedupe(values: string[]) {
    return values.filter((value, index) => value !== values[index - 1])
}

beforeEach(() => {
    hydration.value = true
    snapshots.length = 0
})

afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

describe("useProjects", () => {
    it("marca o conteúdo vazio quando não há projeto", async () => {
        stubProjects([])

        mount()
        await settled()

        expect(latest.isEmptyContent).toBe(true)
        expect(latest.total).toBe(0)
    })

    it("começa carregando, com a contagem vazia antes do texto de carregando", async () => {
        const fetchMock = stubProjects(buildProjectRecords(10))
        const release = holdFetchAfter(fetchMock, 0)

        mount()

        expect(latest.isLoading).toBe(true)
        expect(snapshots[0]?.text).toBe("")
        await waitFor(() => expect(latest.resultsText).toBe("Carregando projetos…"))
        await act(async () => {
            release()
        })
        await settled()
        await waitFor(() => expect(latest.resultsText).toBe("9 de 10 projetos"))
        expect(latest.filters).toEqual({ q: "", sort: "recent" })
    })

    it("usa a query da URL já no primeiro pedido sem hidratação", async () => {
        stubProjects(buildProjectRecords(10))
        const { store } = mount(`${PATH}?type=web&sort=title`)
        await settled()

        const args = Object.values(store.getState().api.queries)
            .filter((entry) => entry?.endpointName === "getProjectsPages")
            .map((entry) => entry?.originalArgs)
        expect(args).toEqual([{ lang: "pt-BR", type: "web", sort: "title" }])
        expect(latest.items.map((item) => item.title)).toEqual([
            "Projeto 1",
            "Projeto 3",
            "Projeto 5",
            "Projeto 7",
            "Projeto 9"
        ])
    })

    it("ignora a query durante a hidratação e a aplica logo depois", async () => {
        stubProjects(buildProjectRecords(10))
        hydration.value = false

        const { rerender, router, store } = mount(`${PATH}?type=web`)
        await settled()
        expect(latest.filters).toEqual({ q: "", sort: "recent" })
        expect(latest.shown).toBe(9)

        hydration.value = true
        rerender(
            <Provider store={store}>
                <RouterProvider router={router} />
            </Provider>
        )

        await waitFor(() => expect(latest.filters.type).toBe("web"))
        await waitFor(() => expect(latest.shown).toBe(5))
    })

    it("ignora valor inválido na query e o tira da URL na próxima mudança", async () => {
        stubProjects(buildProjectRecords(10))
        const { router } = mount(`${PATH}?type=xyz&sort=random`)
        await settled()
        expect(latest.filters).toEqual({ q: "", sort: "recent" })

        act(() => latest.setCategory("academic"))

        await waitFor(() => expect(router.state.location.search).toBe("?category=academic"))
    })

    it("só aplica o termo 300 ms depois da última tecla e reinicia a contagem", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true })
        stubProjects(buildProjectRecords(10))
        const { router } = mount()
        await settled()

        act(() => latest.setDraft("p"))
        act(() => {
            vi.advanceTimersByTime(200)
        })
        act(() => latest.setDraft("pr"))
        act(() => {
            vi.advanceTimersByTime(200)
        })
        expect(latest.draft).toBe("pr")
        expect(router.state.location.search).toBe("")
        expect(latest.filters.q).toBe("")

        act(() => {
            vi.advanceTimersByTime(100)
        })

        await waitFor(() => expect(router.state.location.search).toBe("?q=pr"))
        expect(latest.filters.q).toBe("pr")
    })

    it("aplica clearSearch na hora, sem esperar os 300 ms", async () => {
        stubProjects(buildProjectRecords(10))
        const { router } = mount(`${PATH}?q=projeto`)
        await settled()
        expect(latest.draft).toBe("projeto")

        act(() => latest.clearSearch())

        expect(latest.draft).toBe("")
        await waitFor(() => expect(router.state.location.search).toBe(""))
    })

    it("aplica clearFilters na hora, zera busca, tipo e categoria e mantém a ordenação", async () => {
        stubProjects(buildProjectRecords(10))
        const { router } = mount(`${PATH}?q=projeto&type=web&category=academic&sort=title`)
        await settled()
        expect(latest.hasFilters).toBe(true)

        act(() => latest.clearFilters())

        expect(latest.draft).toBe("")
        await waitFor(() => expect(router.state.location.search).toBe("?sort=title"))
        expect(latest.hasFilters).toBe(false)
    })

    it("não conta a ordenação como filtro", async () => {
        stubProjects(buildProjectRecords(10))

        mount(`${PATH}?sort=oldest`)
        await settled()

        expect(latest.hasFilters).toBe(false)
    })

    it("troca o tipo, ignora o clique no tipo ativo e troca ou desmarca a categoria", async () => {
        stubProjects(buildProjectRecords(10))
        const { router } = mount()
        await settled()

        act(() => latest.setType("web"))
        await waitFor(() => expect(router.state.location.search).toBe("?type=web"))
        await settled()
        const key = router.state.location.key

        act(() => latest.setType("web"))
        expect(router.state.location.key).toBe(key)

        act(() => latest.setType(""))
        await waitFor(() => expect(router.state.location.search).toBe(""))

        act(() => latest.setCategory("academic"))
        await waitFor(() => expect(router.state.location.search).toBe("?category=academic"))
        act(() => latest.setCategory("personal"))
        await waitFor(() => expect(router.state.location.search).toBe("?category=personal"))
        act(() => latest.setCategory("personal"))
        await waitFor(() => expect(router.state.location.search).toBe(""))
    })

    it("reescreve a URL por replace, sem valor padrão, na ordem q, type, category, sort", async () => {
        stubProjects(buildProjectRecords(10))
        const { router } = mount(`${PATH}?sort=title&category=academic`)
        await settled()

        act(() => latest.setType("web"))

        await waitFor(() =>
            expect(router.state.location.search).toBe("?type=web&category=academic&sort=title")
        )
        expect(router.state.historyAction).toBe("REPLACE")
        expect(router.state.preventScrollReset).toBe(true)
    })

    it("mostra só os tipos disponíveis na ordem do enum e acha projeto de vários tipos", async () => {
        stubProjects([
            buildProjectRecord({
                id: "0192f1a0-0000-7000-8000-000000000001",
                title: "Dupla",
                types: ["web", "api"]
            }),
            buildProjectRecord({
                id: "0192f1a0-0000-7000-8000-000000000002",
                title: "Só API",
                types: ["api"]
            })
        ])
        mount()
        await settled()

        expect(latest.typeOptions.map((option) => option.value)).toEqual(["", "web", "api"])
        expect(latest.typeOptions.map((option) => option.label)).toEqual(["Todos", "Web", "API"])

        act(() => latest.setType("api"))

        await waitFor(() => expect(latest.items.map((item) => item.title)).toContain("Dupla"))
    })

    it("aplica um tipo válido fora dos disponíveis, sem botão pressionado", async () => {
        stubProjects(buildProjectRecords(10))
        mount(`${PATH}?type=iot`)
        await settled()

        expect(latest.total).toBe(0)
        expect(latest.typeValue).toBe("iot")
        expect(latest.typeOptions.map((option) => option.value)).not.toContain("iot")
        expect(latest.hasFilters).toBe(true)
        expect(latest.isNoResults).toBe(true)
    })

    it.each([
        [10, "9 de 10 projetos"],
        [20, "9 de 20 projetos"],
        [1, "1 de 1 projeto"],
        [0, "0 projetos"]
    ])("conta com %i projetos como %s", async (count, expected) => {
        stubProjects(buildProjectRecords(count))

        mount()
        await settled()

        await waitFor(() => expect(latest.resultsText).toBe(expected))
    })

    it("devolve a contagem vazia no erro", async () => {
        stubContentFetch({})

        mount()

        await waitFor(() => expect(latest.isError).toBe(true))
        await waitFor(() => expect(latest.resultsText).toBe(""))
    })

    it("acrescenta o último card com 10 projetos e esconde o botão", async () => {
        stubProjects(buildProjectRecords(10))
        mount()
        await settled()
        expect(latest.hasMore).toBe(true)

        act(() => latest.loadMore())

        await waitFor(() => expect(latest.shown).toBe(10))
        expect(latest.hasMore).toBe(false)
        await waitFor(() => expect(latest.resultsText).toBe("10 de 10 projetos"))
    })

    it("acrescenta 9 e depois 2 cards com 20 projetos", async () => {
        stubProjects(buildProjectRecords(20))
        mount()
        await settled()

        act(() => latest.loadMore())
        await waitFor(() => expect(latest.shown).toBe(18))
        await waitFor(() => expect(latest.resultsText).toBe("18 de 20 projetos"))
        expect(latest.hasMore).toBe(true)

        act(() => latest.loadMore())
        await waitFor(() => expect(latest.shown).toBe(20))
        expect(latest.hasMore).toBe(false)
    })

    it("mantém a contagem, mostra os esqueletos e ignora o segundo clique enquanto a página chega", async () => {
        const fetchMock = stubProjects(buildProjectRecords(20))
        mount()
        await settled()
        const release = holdFetchAfter(fetchMock, 0)
        const before = projectRequests(fetchMock)

        act(() => latest.loadMore())
        await waitFor(() => expect(latest.isFetchingMore).toBe(true))
        act(() => latest.loadMore())

        expect(latest.skeletonCount).toBe(9)
        await waitFor(() => expect(latest.resultsText).toBe("9 de 20 projetos"))
        expect(latest.shown).toBe(9)

        await act(async () => {
            release()
        })
        await waitFor(() => expect(latest.shown).toBe(18))
        expect(projectRequests(fetchMock) - before).toBe(1)
        expect(latest.skeletonCount).toBe(0)
    })

    it("usa min(9, faltantes) esqueletos na última página", async () => {
        const fetchMock = stubProjects(buildProjectRecords(20))
        mount()
        await settled()
        act(() => latest.loadMore())
        await waitFor(() => expect(latest.shown).toBe(18))
        const release = holdFetchAfter(fetchMock, 0)

        act(() => latest.loadMore())

        await waitFor(() => expect(latest.skeletonCount).toBe(2))
        await act(async () => {
            release()
        })
        await waitFor(() => expect(latest.shown).toBe(20))
    })

    it("foca o link do primeiro card novo e muda a contagem uma só vez", async () => {
        stubProjects(buildProjectRecords(20))
        mount()
        await settled()
        snapshots.length = 0

        act(() => latest.loadMore())
        await waitFor(() => expect(latest.shown).toBe(18))

        await waitFor(() => expect(document.activeElement).toHaveTextContent(/^Projeto/))
        expect(document.activeElement).toHaveTextContent(latest.items[9]?.title ?? "")
        expect(dedupe(snapshots.map((snapshot) => snapshot.text))).toEqual([
            "9 de 20 projetos",
            "18 de 20 projetos"
        ])
    })

    it("mantém os cards e a contagem na falha, esconde o botão, foca o alerta e refaz só a página que faltou", async () => {
        const fetchMock = stubProjects(buildProjectRecords(20))
        mount()
        await settled()
        const recover = failFetchAfter(fetchMock, 0)

        act(() => latest.loadMore())

        await waitFor(() => expect(latest.loadMoreError).toBe(true))
        expect(latest.shown).toBe(9)
        await waitFor(() => expect(latest.resultsText).toBe("9 de 20 projetos"))
        expect(latest.hasMore).toBe(false)
        expect(latest.skeletonCount).toBe(0)
        expect(document.activeElement).toHaveAttribute("id", latest.ids.loadMoreAlert)

        recover()
        act(() => latest.retryLoadMore())

        await waitFor(() => expect(latest.shown).toBe(18))
        expect(latest.loadMoreError).toBe(false)
        expect(document.activeElement).toHaveTextContent(latest.items[9]?.title ?? "")
    })

    it("volta a uma página só ao mudar o filtro depois de carregar mais", async () => {
        stubProjects(buildProjectRecords(20))
        mount()
        await settled()
        act(() => latest.loadMore())
        await waitFor(() => expect(latest.shown).toBe(18))

        act(() => latest.setType("web"))

        await waitFor(() => expect(latest.total).toBe(10))
        expect(latest.shown).toBe(9)
    })

    it("volta ao primeiro lote com clearFilters mesmo com a lista padrão em cache", async () => {
        stubProjects(buildProjectRecords(20))
        const { router } = mount()
        await settled()
        act(() => latest.loadMore())
        await waitFor(() => expect(latest.shown).toBe(18))
        act(() => latest.setType("web"))
        await waitFor(() => expect(latest.total).toBe(10))

        act(() => latest.clearFilters())

        await waitFor(() => expect(latest.filters.type).toBeUndefined())
        await waitFor(() => expect(latest.total).toBe(20))
        expect(latest.shown).toBe(9)
        expect(router.state.location.state).toBeNull()
    })

    it("mantém a lista anterior e a contagem até a nova lista chegar", async () => {
        const fetchMock = stubProjects(buildProjectRecords(20))
        mount()
        await settled()
        const release = holdFetchAfter(fetchMock, 0)

        act(() => latest.setType("web"))

        await waitFor(() => expect(latest.filters.type).toBe("web"))
        expect(latest.isLoading).toBe(false)
        expect(latest.shown).toBe(9)
        await waitFor(() => expect(latest.resultsText).toBe("9 de 20 projetos"))

        await act(async () => {
            release()
        })
        await waitFor(() => expect(latest.resultsText).toBe("9 de 10 projetos"))
    })

    it("mostra o erro da lista com os filtros intactos e refaz o pedido focando o título", async () => {
        const fetchMock = stubProjects(buildProjectRecords(10))
        mount(`${PATH}?type=web&sort=title`)
        await settled()
        const recover = failFetchAfter(fetchMock, 0)
        act(() => latest.setCategory("academic"))
        await waitFor(() => expect(latest.isError).toBe(true))

        expect(latest.filters).toEqual({ q: "", type: "web", category: "academic", sort: "title" })
        await waitFor(() => expect(latest.resultsText).toBe(""))

        recover()
        const release = holdFetchAfter(fetchMock, 0)
        act(() => {
            void latest.retry()
        })

        expect(document.activeElement).toHaveAttribute("id", latest.ids.heading)
        await waitFor(() => expect(latest.isError).toBe(false))
        await act(async () => {
            release()
        })
        await waitFor(() => expect(latest.total).toBeGreaterThan(0))
    })

    it("guarda a quantidade de páginas no estado da entrada atual do histórico", async () => {
        stubProjects(buildProjectRecords(20))
        const { router } = mount()
        await settled()

        act(() => latest.loadMore())
        await waitFor(() => expect(latest.shown).toBe(18))

        await waitFor(() => expect(router.state.location.state).toEqual({ pages: 2 }))
        expect(router.state.historyAction).toBe("REPLACE")
        expect(router.state.preventScrollReset).toBe(true)
    })

    it("restaura duas páginas do cache sem passar por carregando", async () => {
        stubProjects(buildProjectRecords(20))
        const first = mount()
        await settled()
        act(() => latest.loadMore())
        await waitFor(() => expect(latest.shown).toBe(18))
        first.unmount()
        snapshots.length = 0

        mount({ pathname: PATH, state: { pages: 2 } }, first.store)

        await waitFor(() => expect(latest.shown).toBe(18))
        expect(snapshots[0]).toMatchObject({ isLoading: false, shown: 18 })
        expect(snapshots.some((snapshot) => snapshot.isLoading)).toBe(false)
    })

    it("pede de novo as páginas e mostra carregando com o cache vazio", async () => {
        stubProjects(buildProjectRecords(20))

        mount({ pathname: PATH, state: { pages: 2 } })

        expect(latest.isLoading).toBe(true)
        await waitFor(() => expect(latest.shown).toBe(18))
    })

    it("abre no primeiro lote com a query aplicada quando não há estado", async () => {
        stubProjects(buildProjectRecords(20))

        mount(`${PATH}?type=web`)
        await settled()

        expect(latest.shown).toBe(9)
        expect(latest.filters.type).toBe("web")
    })

    it("acumula as páginas na ordem recebida, sem reordenar", async () => {
        stubProjects(buildProjectRecords(20))
        const original = vi.mocked(listProjects).getMockImplementation()
        vi.mocked(listProjects).mockImplementation((records, params) => {
            const page = original?.(records, params)

            if (!page) {
                throw new Error("sem implementação original")
            }

            return { ...page, items: page.items.toReversed() }
        })
        mount()

        await settled()
        const firstPage = latest.items.map((item) => item.title)
        act(() => latest.loadMore())
        await waitFor(() => expect(latest.shown).toBe(18))

        expect(firstPage[0]).toBe("Projeto 12")
        expect(latest.items.slice(0, 9).map((item) => item.title)).toEqual(firstPage)
        expect(latest.items[9]?.title).toBe("Projeto 3")
        vi.mocked(listProjects).mockImplementation((records, params) => {
            if (!original) {
                throw new Error("sem implementação original")
            }

            return original(records, params)
        })
    })

    it("devolve o JSON-LD com todos os projetos, sem aplicar a query, só quando o índice chega", async () => {
        const fetchMock = stubProjects(buildProjectRecords(20))
        const store = createStore()
        const release = holdFetchAfter(fetchMock, 1)

        mount(`${PATH}?q=projeto%201`, store)
        expect(latest.jsonLd).toBeUndefined()

        await act(async () => {
            release()
        })
        await waitFor(() => expect(latest.jsonLd).toBeDefined())

        const list = latest.jsonLd?.mainEntity
        expect(list).toMatchObject({ "@type": "ItemList" })
        expect(
            Object.values(store.getState().api.queries).some(
                (entry) => entry?.endpointName === projectsApi.endpoints.getProjectsIndex.name
            )
        ).toBe(true)
        expect(JSON.stringify(latest.jsonLd).match(/"@type":"ListItem"/g)).toHaveLength(20)
    })
})
