import { afterEach, describe, expect, it, vi } from "vitest"
import loadPrerenderData from "@/prerender/loadPrerenderData"
import prerenderRoutes from "@/prerender/prerenderRoutes"
import projectsApi from "@/store/api/projects.api"
import createStore from "@/store/createStore"
import buildProfile from "@/testUtils/buildProfile"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import stubContentFetch from "@/testUtils/stubContentFetch"
import buildProjectsQueryArgs from "@/utils/buildProjectsQueryArgs"
import type PrerenderRoute from "@/types/prerender/PrerenderRoute.types"

const DOCUMENT_ID = "0192f1d0-2b3c-7d4e-8f50-61728394a5b6"

function findRoute(pattern: string): PrerenderRoute {
    const route = prerenderRoutes.find((candidate) => candidate.pattern === pattern)

    if (!route) {
        throw new Error(`Rota ${pattern} fora do registro`)
    }

    return route
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("prerenderRoutes", () => {
    it("descreve Início, as telas e o documento de projeto", () => {
        expect(prerenderRoutes.map((route) => route.pattern)).toEqual([
            "",
            "projects",
            "about",
            "contact",
            "projects/:id",
            "projects/:id/docs/:name"
        ])
    })

    it("nunca inclui a raiz nem a rota *", () => {
        expect(prerenderRoutes.map((route) => route.pattern)).not.toContain("/")
        expect(prerenderRoutes.map((route) => route.pattern)).not.toContain("*")
    })

    it("pede na rota de projetos a página e o índice com os argumentos da tela", async () => {
        const record = buildProjectRecord()
        stubContentFetch({
            "content/pt-BR/profile.json": buildProfile(),
            "content/pt-BR/projects.json": { items: [record] }
        })
        const store = createStore()

        await loadPrerenderData(store, findRoute("projects"), {}, "pt-BR")

        const args = buildProjectsQueryArgs("pt-BR", { q: "", sort: "recent" })
        expect(args).toStrictEqual({ lang: "pt-BR" })
        const pages = projectsApi.endpoints.getProjectsPages.select(args)(store.getState())
        const index = projectsApi.endpoints.getProjectsIndex.select({ lang: "pt-BR" })(
            store.getState()
        )
        expect(pages.data?.pages[0]?.items.map((item) => item.id)).toEqual([record.id])
        expect(index.data?.items).toEqual([{ id: record.id, title: record.title }])
    })

    it("pede o conteúdo do documento na rota de documento", async () => {
        const record = buildProjectRecord({
            documents: [{ id: DOCUMENT_ID, name: "SETUP.md", format: "markdown", translated: true }]
        })
        stubContentFetch({
            "content/pt-BR/profile.json": buildProfile(),
            "content/pt-BR/projects.json": { items: [record] },
            [`content/pt-BR/projects/${record.id}/docs/SETUP.md`]: "## Setup"
        })
        const store = createStore()

        await loadPrerenderData(
            store,
            findRoute("projects/:id/docs/:name"),
            { id: record.id, name: "SETUP.md", documentId: DOCUMENT_ID },
            "pt-BR"
        )

        const cached = Object.values(store.getState().api.queries).map((entry) => entry?.data)
        expect(cached).toContain("## Setup")
    })
})
