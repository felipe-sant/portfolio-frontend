import { afterEach, describe, expect, it, vi } from "vitest"
import { Provider } from "react-redux"
import { render, screen } from "@testing-library/react"
import listProjects from "@/services/content/listProjects"
import projectsApi from "@/store/api/projects.api"
import createStore from "@/store/createStore"
import buildProfile from "@/testUtils/buildProfile"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import parseUntyped from "@/testUtils/parseUntyped"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectListParams from "@/types/project/ProjectListParams.types"

vi.mock("@/services/content/listProjects", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/services/content/listProjects")>()

    return { default: vi.fn(original.default) }
})

type Endpoint = "list" | "detail" | "documents" | "content"

type ProbeProps = {
    endpoint: Endpoint
    list?: ProjectListParams
    item?: { id: string; lang: SupportedLanguage }
    documentId?: string
}

function Probe({ endpoint, list, item, documentId }: ProbeProps) {
    const listResult = projectsApi.useGetProjectsQuery(list ?? { lang: "pt-BR" }, {
        skip: endpoint !== "list"
    })
    const detailResult = projectsApi.useGetProjectQuery(item ?? { id: "", lang: "pt-BR" }, {
        skip: endpoint !== "detail"
    })
    const documentsResult = projectsApi.useGetProjectDocumentsQuery(
        item ?? { id: "", lang: "pt-BR" },
        { skip: endpoint !== "documents" }
    )
    const contentResult = projectsApi.useGetProjectDocumentContentQuery(
        { ...(item ?? { id: "", lang: "pt-BR" }), documentId: documentId ?? "" },
        { skip: endpoint !== "content" }
    )
    const { data, error, isFetching } = {
        list: listResult,
        detail: detailResult,
        documents: documentsResult,
        content: contentResult
    }[endpoint]

    return isFetching ? null : <pre data-testid="result">{JSON.stringify({ data, error })}</pre>
}

async function resultOf() {
    const element = await screen.findByTestId("result")
    return JSON.parse(element.textContent ?? "")
}

const first = buildProjectRecord({
    id: "0192f1a0-0000-7000-8000-000000000001",
    title: "Maps",
    date: "2026-03",
    featured: true,
    documents: [
        {
            id: "0192f1d0-0000-7000-8000-000000000001",
            name: "SETUP.md",
            format: "markdown",
            translated: true
        },
        {
            id: "0192f1d0-0000-7000-8000-000000000002",
            name: "README.md",
            format: "markdown",
            translated: true
        },
        {
            id: "0192f1d0-0000-7000-8000-000000000003",
            name: "LICENSE",
            format: "text",
            translated: false,
            contentLanguage: "en"
        }
    ],
    related: [{ id: "0192f1a0-0000-7000-8000-000000000002", reason: "Mesma stack" }]
})
const second = buildProjectRecord({
    id: "0192f1a0-0000-7000-8000-000000000002",
    title: "Catálogo de componentes",
    date: "2025-11",
    types: ["library"]
})

function files(lang: string) {
    return {
        [`content/${lang}/projects.json`]: { items: [first, second] },
        [`content/${lang}/projects/${first.id}/docs/README.md`]: `## ${lang}`,
        [`content/${lang}/projects/${first.id}/docs/SETUP.md`]: "## Setup",
        [`content/shared/projects/${first.id}/docs/LICENSE`]: "MIT License"
    }
}

afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe("projectsApi", () => {
    it("lista projetos com a forma de ProjectPage", async () => {
        stubContentFetch(files("pt-BR"))

        renderWithStore(<Probe endpoint="list" list={{ lang: "pt-BR", sort: "title" }} />)

        const { data } = await resultOf()
        expect(data.items.map((item: { title: string }) => item.title)).toEqual([
            "Catálogo de componentes",
            "Maps"
        ])
        expect(data).toMatchObject({ total: 2, offset: 0, limit: 9 })
        expect(data.availableTypes).toEqual(["web", "library"])
    })

    it("aplica busca e filtros do contrato", async () => {
        stubContentFetch(files("pt-BR"))

        renderWithStore(
            <Probe endpoint="list" list={{ lang: "pt-BR", q: "catalogo", type: "library" }} />
        )

        expect((await resultOf()).data.total).toBe(1)
    })

    it("refaz o pedido quando o idioma muda", async () => {
        const fetchMock = stubContentFetch({ ...files("pt-BR"), ...files("en") })

        const { rerender, store } = renderWithStore(
            <Probe endpoint="list" list={{ lang: "pt-BR" }} />
        )
        await resultOf()
        rerender(
            <Provider store={store}>
                <Probe endpoint="list" list={{ lang: "en" }} />
            </Provider>
        )

        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/content/en/projects.json"))
    })

    it.each([
        ["sort inválido", '{"lang":"pt-BR","sort":"random"}', "INVALID_PARAMETER"],
        ["limit 0", '{"lang":"pt-BR","limit":0}', "INVALID_PARAMETER"],
        ["lang inválido", '{"lang":"fr"}', "UNSUPPORTED_LANGUAGE"]
    ])("responde 400 para %s", async (_name, json, code) => {
        const fetchMock = stubContentFetch({})

        renderWithStore(<Probe endpoint="list" list={parseUntyped(json)} />)

        const { error } = await resultOf()
        expect(error.status).toBe(400)
        expect(error.data.error.code).toBe(code)
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("devolve o detalhe com related expandido e README.md primeiro", async () => {
        stubContentFetch(files("pt-BR"))

        renderWithStore(<Probe endpoint="detail" item={{ id: first.id, lang: "pt-BR" }} />)

        const { data } = await resultOf()
        expect(data.technologies).toEqual(["React", "TypeScript"])
        expect(data.related[0].project.title).toBe("Catálogo de componentes")
        expect(data.documents.map((document: { name: string }) => document.name)).toEqual([
            "README.md",
            "SETUP.md",
            "LICENSE"
        ])
    })

    it("responde 400 INVALID_ID para id fora de UUID v7", async () => {
        const fetchMock = stubContentFetch({})

        renderWithStore(<Probe endpoint="detail" item={{ id: "maps", lang: "pt-BR" }} />)

        const { error } = await resultOf()
        expect(error.status).toBe(400)
        expect(error.data.error.code).toBe("INVALID_ID")
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("responde 404 NOT_FOUND para projeto inexistente", async () => {
        stubContentFetch(files("pt-BR"))

        renderWithStore(
            <Probe
                endpoint="detail"
                item={{ id: "0192f1a0-0000-7000-8000-0000000000ff", lang: "pt-BR" }}
            />
        )

        const { error } = await resultOf()
        expect(error.status).toBe(404)
        expect(error.data.error.code).toBe("NOT_FOUND")
    })

    it("lista os documentos do projeto", async () => {
        stubContentFetch(files("en"))

        renderWithStore(<Probe endpoint="documents" item={{ id: first.id, lang: "en" }} />)

        const { data } = await resultOf()
        expect(data.items).toHaveLength(3)
        expect(data.items[0].name).toBe("README.md")
    })

    it("devolve o texto do documento traduzido no idioma pedido", async () => {
        stubContentFetch(files("en"))

        renderWithStore(
            <Probe
                endpoint="content"
                item={{ id: first.id, lang: "en" }}
                documentId="0192f1d0-0000-7000-8000-000000000002"
            />
        )

        expect((await resultOf()).data).toBe("## en")
    })

    it("devolve o documento neutro da pasta shared", async () => {
        const fetchMock = stubContentFetch(files("es"))

        renderWithStore(
            <Probe
                endpoint="content"
                item={{ id: first.id, lang: "es" }}
                documentId="0192f1d0-0000-7000-8000-000000000003"
            />
        )

        expect((await resultOf()).data).toBe("MIT License")
        expect(fetchMock).toHaveBeenCalledWith(`/content/shared/projects/${first.id}/docs/LICENSE`)
    })

    it("responde 404 para documento que não está no projeto e 400 para id inválido", async () => {
        stubContentFetch(files("pt-BR"))

        const { unmount } = renderWithStore(
            <Probe
                endpoint="content"
                item={{ id: first.id, lang: "pt-BR" }}
                documentId="0192f1d0-0000-7000-8000-0000000000ff"
            />
        )
        expect((await resultOf()).error.status).toBe(404)
        unmount()

        renderWithStore(
            <Probe
                endpoint="content"
                item={{ id: first.id, lang: "pt-BR" }}
                documentId="README.md"
            />
        )
        expect((await resultOf()).error.data.error.code).toBe("INVALID_ID")
    })

    it("responde FETCH_ERROR e não 404 quando o arquivo de projetos não carrega", async () => {
        stubContentFetch({})

        renderWithStore(<Probe endpoint="detail" item={{ id: first.id, lang: "pt-BR" }} />)

        expect((await resultOf()).error.status).toBe("FETCH_ERROR")
    })

    it("pede os arquivos com o prefixo do GitHub Pages e não chama a API", async () => {
        vi.stubEnv("BASE_URL", "/ra2581392423047/")
        vi.stubEnv("VITE_API_URL", "https://api.example.com")
        vi.resetModules()
        const { default: freshApi } = await import("@/store/api/projects.api")
        const { default: freshRender } = await import("@/testUtils/renderWithStore")
        const fetchMock = stubContentFetch(files("pt-BR"))

        function FreshProbe() {
            const { data } = freshApi.useGetProjectsQuery({ lang: "pt-BR" })
            return <p>{data ? `total ${data.total}` : null}</p>
        }

        freshRender(<FreshProbe />)

        expect(await screen.findByText("total 2")).toBeInTheDocument()
        expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
            "/ra2581392423047/content/pt-BR/projects.json"
        ])
    })
})

function PagesReader() {
    const { data } = projectsApi.useGetProjectsPagesInfiniteQuery({ lang: "pt-BR" })

    return <p>{data ? `total ${data.pages[0]?.total}` : "vazio"}</p>
}

function buildRecords(count: number) {
    return Array.from({ length: count }, (_value, index) =>
        buildProjectRecord({
            id: `0192f1a0-0000-7000-8000-${String(index + 1).padStart(12, "0")}`,
            title: `Projeto ${index + 1}`,
            date: `${2000 + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`,
            types: index % 2 === 0 ? ["web"] : ["api"]
        })
    )
}

function stubProjects(count: number) {
    return stubContentFetch({ "content/pt-BR/projects.json": { items: buildRecords(count) } })
}

function fetchNext(store: ReturnType<typeof createStore>, args: ProjectListParams) {
    return store.dispatch(
        projectsApi.endpoints.getProjectsPages.initiate(args, { direction: "forward" })
    )
}

function pagesOf(store: ReturnType<typeof createStore>, args: ProjectListParams) {
    const result = projectsApi.endpoints.getProjectsPages.select(args)(store.getState())

    return result.data?.pages ?? []
}

describe("projectsApi, páginas e índice", () => {
    it("devolve uma página vazia, sem próxima, para conteúdo sem projeto", async () => {
        stubProjects(0)
        const store = createStore()

        const result = await store.dispatch(
            projectsApi.endpoints.getProjectsPages.initiate({ lang: "pt-BR" })
        )

        expect(result.data?.pages).toHaveLength(1)
        expect(result.data?.pages[0]).toMatchObject({ items: [], total: 0 })
        expect(result.hasNextPage).toBe(false)
    })

    it("traz 9 na primeira página e 1 na segunda, sem próxima, com 10 projetos", async () => {
        stubProjects(10)
        const store = createStore()

        const firstPage = await store.dispatch(
            projectsApi.endpoints.getProjectsPages.initiate({ lang: "pt-BR" })
        )
        expect(firstPage.data?.pages.map((page) => page.items.length)).toEqual([9])
        expect(firstPage.hasNextPage).toBe(true)

        const secondPage = await fetchNext(store, { lang: "pt-BR" })
        expect(secondPage.data?.pages.map((page) => page.items.length)).toEqual([9, 1])
        expect(secondPage.hasNextPage).toBe(false)
    })

    it("acumula 9, 18 e 20 com 20 projetos", async () => {
        stubProjects(20)
        const store = createStore()
        const args = { lang: "pt-BR" } as const

        await store.dispatch(projectsApi.endpoints.getProjectsPages.initiate(args))
        const secondPage = await fetchNext(store, args)
        expect(secondPage.hasNextPage).toBe(true)
        const thirdPage = await fetchNext(store, args)

        const counts = thirdPage.data?.pages.map((page) => page.items.length)
        expect(counts).toEqual([9, 9, 2])
        expect(thirdPage.hasNextPage).toBe(false)
        expect(pagesOf(store, args)).toHaveLength(3)
    })

    it("usa só o argumento sem offset como chave e o hook relê o que o initiate assinou", async () => {
        const fetchMock = stubProjects(3)
        const store = createStore()
        await store.dispatch(projectsApi.endpoints.getProjectsPages.initiate({ lang: "pt-BR" }))
        const calls = fetchMock.mock.calls.length

        render(
            <Provider store={store}>
                <PagesReader />
            </Provider>
        )

        expect(await screen.findByText("total 3")).toBeInTheDocument()
        expect(fetchMock.mock.calls.length).toBe(calls)
        expect(pagesOf(store, { lang: "pt-BR" })).toHaveLength(1)
    })

    it("repassa q, type, category e sort e devolve availableTypes da primeira página", async () => {
        stubProjects(10)
        const store = createStore()
        vi.mocked(listProjects).mockClear()

        const result = await store.dispatch(
            projectsApi.endpoints.getProjectsPages.initiate({
                lang: "pt-BR",
                q: "projeto",
                type: "web",
                category: "personal",
                sort: "title"
            })
        )

        expect(vi.mocked(listProjects).mock.calls[0]?.[1]).toMatchObject({
            q: "projeto",
            type: "web",
            category: "personal",
            sort: "title",
            offset: 0,
            limit: 9
        })
        expect(result.data?.pages[0]?.availableTypes).toEqual(["web", "api"])
    })

    it("repassa tech e year e devolve a primeira página filtrada com as opções", async () => {
        stubProjects(20)
        const store = createStore()

        const result = await store.dispatch(
            projectsApi.endpoints.getProjectsPages.initiate({
                lang: "pt-BR",
                tech: ["React"],
                year: ["2001"]
            })
        )

        expect(result.data?.pages[0]).toMatchObject({
            total: 8,
            availableTechnologies: ["React", "TypeScript"],
            availableYears: ["2001", "2000"]
        })
    })

    it("mantém a primeira página quando a segunda falha e refaz só a que faltou", async () => {
        stubProjects(20)
        const store = createStore()
        await store.dispatch(projectsApi.endpoints.getProjectsPages.initiate({ lang: "pt-BR" }))
        vi.mocked(listProjects).mockClear()
        vi.mocked(listProjects).mockImplementationOnce(() => {
            throw new Error("falha")
        })

        const failed = await fetchNext(store, { lang: "pt-BR" })
        expect(failed.isError).toBe(true)
        expect(failed.data?.pages).toHaveLength(1)

        const retried = await fetchNext(store, { lang: "pt-BR" })
        expect(retried.isError).toBe(false)
        expect(retried.data?.pages).toHaveLength(2)
        expect(vi.mocked(listProjects).mock.calls.map(([, params]) => params.offset)).toEqual([
            9, 9
        ])
    })

    it("devolve os 120 pares id e título em ordem recent com três chamadas de limit 50", async () => {
        stubProjects(120)
        const store = createStore()
        vi.mocked(listProjects).mockClear()

        const result = await store.dispatch(
            projectsApi.endpoints.getProjectsIndex.initiate({ lang: "pt-BR" })
        )

        expect(result.data?.items).toHaveLength(120)
        expect(result.data?.items[0]).toEqual({
            id: "0192f1a0-0000-7000-8000-000000000120",
            title: "Projeto 120"
        })
        expect(result.data?.items.at(-1)?.title).toBe("Projeto 1")
        expect(Object.keys(result.data?.items[0] ?? {})).toEqual(["id", "title"])
        expect(
            vi.mocked(listProjects).mock.calls.map(([, params]) => [params.offset, params.limit])
        ).toEqual([
            [0, 50],
            [50, 50],
            [100, 50]
        ])
        expect(
            vi.mocked(listProjects).mock.calls.every(([, params]) => params.sort === "recent")
        ).toBe(true)
    })

    it("converte a falha da camada local em erro no formato do contrato no índice", async () => {
        stubContentFetch({})
        const store = createStore()

        const result = await store.dispatch(
            projectsApi.endpoints.getProjectsIndex.initiate({ lang: "pt-BR" })
        )

        expect(result.error).toMatchObject({ status: "FETCH_ERROR" })
    })
})

function requestOptions(store: ReturnType<typeof createStore>, args: { lang: SupportedLanguage }) {
    return store.dispatch(projectsApi.endpoints.getProjectFilterOptions.initiate(args))
}

function optionFiles(lang: string) {
    return {
        [`content/${lang}/projects.json`]: { items: [first, second] },
        [`content/${lang}/profile.json`]: buildProfile({
            stack: [
                {
                    category: "frontend",
                    items: [{ name: "React" }, { name: "Docker" }]
                }
            ]
        })
    }
}

describe("projectsApi, getProjectFilterOptions", () => {
    it("devolve a forma ProjectFilterOptions com a stack do perfil e os projetos", async () => {
        stubContentFetch(optionFiles("pt-BR"))
        const store = createStore()

        const result = await requestOptions(store, { lang: "pt-BR" })

        expect(result.data).toStrictEqual({
            technologies: [
                { value: "Docker", count: 0 },
                { value: "React", count: 2 },
                { value: "TypeScript", count: 2 }
            ],
            years: [
                { value: "2026", count: 1 },
                { value: "2025", count: 1 }
            ]
        })
    })

    it("trocar o idioma faz outro pedido e outra chave de cache", async () => {
        const fetchMock = stubContentFetch({ ...optionFiles("pt-BR"), ...optionFiles("en") })
        const store = createStore()

        await requestOptions(store, { lang: "pt-BR" })
        await requestOptions(store, { lang: "en" })

        expect(fetchMock).toHaveBeenCalledWith("/content/en/profile.json")
        expect(fetchMock).toHaveBeenCalledWith("/content/en/projects.json")
        const keys = Object.keys(store.getState().api.queries)
        expect(keys).toContain('getProjectFilterOptions({"lang":"pt-BR"})')
        expect(keys).toContain('getProjectFilterOptions({"lang":"en"})')
    })

    it("responde UNSUPPORTED_LANGUAGE para um idioma inválido sem ler o conteúdo", async () => {
        const fetchMock = stubContentFetch({})
        const store = createStore()

        const result = await store.dispatch(
            projectsApi.endpoints.getProjectFilterOptions.initiate(parseUntyped('{"lang":"fr"}'))
        )

        expect(result.error).toMatchObject({
            status: 400,
            data: { error: { code: "UNSUPPORTED_LANGUAGE" } }
        })
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it.each([
        ["o perfil", "content/pt-BR/profile.json"],
        ["os projetos", "content/pt-BR/projects.json"]
    ])("vira erro no formato do contrato quando falha a leitura d%s", async (_name, path) => {
        const available: Record<string, unknown> = optionFiles("pt-BR")
        delete available[path]
        stubContentFetch(available)
        const store = createStore()

        const result = await requestOptions(store, { lang: "pt-BR" })

        expect(result.isError).toBe(true)
        expect(result.error).toMatchObject({ status: "FETCH_ERROR" })
    })
})
