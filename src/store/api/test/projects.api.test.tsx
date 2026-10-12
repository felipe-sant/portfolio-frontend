import { afterEach, describe, expect, it, vi } from "vitest"
import { Provider } from "react-redux"
import { screen } from "@testing-library/react"
import projectsApi from "@/store/api/projects.api"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import parseUntyped from "@/testUtils/parseUntyped"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectListParams from "@/types/project/ProjectListParams.types"

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
