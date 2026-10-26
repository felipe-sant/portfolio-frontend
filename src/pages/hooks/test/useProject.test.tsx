import { useEffect } from "react"
import { Provider } from "react-redux"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { act, render, waitFor } from "@testing-library/react"
import setLanguage from "@/i18n/setLanguage"
import useProject from "@/pages/hooks/useProject"
import createStore from "@/store/createStore"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import failFetchAfter from "@/testUtils/failFetchAfter"
import holdFetchAfter from "@/testUtils/holdFetchAfter"
import stubContentFetch from "@/testUtils/stubContentFetch"

type ProjectHook = ReturnType<typeof useProject>

const ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"

let latest: ProjectHook

function Probe() {
    const state = useProject()

    useEffect(() => {
        latest = state
    })

    return null
}

function stubFiles() {
    const files: Record<string, unknown> = {}

    for (const [language, title] of [
        ["pt-BR", "Mapas"],
        ["en", "Maps"],
        ["es", "Mapas ES"]
    ]) {
        files[`content/${language}/projects.json`] = {
            items: [buildProjectRecord({ id: ID, title })]
        }
    }

    return stubContentFetch(files)
}

function mount(id: string) {
    const store = createStore()
    const router = createMemoryRouter([{ path: "/:lang/projects/:id", element: <Probe /> }], {
        initialEntries: [`/pt-BR/projects/${id}`]
    })
    render(
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    )

    return store
}

beforeEach(() => {
    window.history.pushState({}, "", "/")
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("useProject", () => {
    it("com id fora do formato, devolve não encontrado e não faz requisição", async () => {
        const fetchMock = stubFiles()
        const store = mount("nao-e-um-uuid")

        await waitFor(() => expect(latest.status).toBe("notFound"))
        expect(fetchMock).not.toHaveBeenCalled()
        expect(Object.keys(store.getState().api.queries)).toEqual([])
    })

    it("com id válido sem projeto (404 do conteúdo), devolve não encontrado", async () => {
        stubFiles()
        mount("0192f1a0-7c3e-7b21-8d4f-000000000000")

        await waitFor(() => expect(latest.status).toBe("notFound"))
    })

    it("com projeto existente, devolve sucesso chamando getProject com exatamente { id, lang }", async () => {
        stubFiles()
        const store = mount(ID)

        await waitFor(() => expect(latest.status).toBe("success"))
        expect(latest.project?.title).toBe("Mapas")
        const queries = Object.values(store.getState().api.queries)
        expect(queries).toHaveLength(1)
        expect(queries[0]?.endpointName).toBe("getProject")
        expect(queries[0]?.originalArgs).toEqual({ id: ID, lang: "pt-BR" })
    })

    it("carregando, devolve o título de fallback; com erro, devolve erro e o mesmo título", async () => {
        const fetchMock = stubFiles()
        failFetchAfter(fetchMock, 0)
        mount(ID)

        expect(latest.status).toBe("loading")
        expect(latest.fallbackTitle).toBe("Projeto · Luiz Felipe dos Santos")

        await waitFor(() => expect(latest.status).toBe("error"))
        expect(latest.fallbackTitle).toBe("Projeto · Luiz Felipe dos Santos")
    })

    it("mantém o carregando enquanto a resposta não chega", async () => {
        const fetchMock = stubFiles()
        const release = holdFetchAfter(fetchMock, 0)
        mount(ID)

        expect(latest.status).toBe("loading")

        release()
        await waitFor(() => expect(latest.status).toBe("success"))
    })

    it("retry refaz a requisição e a tela vai a sucesso", async () => {
        const fetchMock = stubFiles()
        const recover = failFetchAfter(fetchMock, 0)
        mount(ID)
        await waitFor(() => expect(latest.status).toBe("error"))

        recover()
        await act(async () => {
            await latest.retry()
        })

        await waitFor(() => expect(latest.status).toBe("success"))
    })

    it("pede o projeto em en ao trocar de idioma, sem misturar com pt-BR", async () => {
        stubFiles()
        mount(ID)
        await waitFor(() => expect(latest.project?.title).toBe("Mapas"))

        await act(() => setLanguage("en"))

        await waitFor(() => expect(latest.project?.title).toBe("Maps"))
    })
})
