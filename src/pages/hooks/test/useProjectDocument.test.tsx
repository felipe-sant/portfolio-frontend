import { useEffect } from "react"
import { Provider } from "react-redux"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render, waitFor } from "@testing-library/react"
import setLanguage from "@/i18n/setLanguage"
import useProjectDocument from "@/pages/hooks/useProjectDocument"
import createStore from "@/store/createStore"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import parseUntyped from "@/testUtils/parseUntyped"
import failFetchAfter from "@/testUtils/failFetchAfter"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type ProjectDetail from "@/types/project/ProjectDetail.types"
import type ProjectDocument from "@/types/project/ProjectDocument.types"
import buildProjectDetailFixture from "@/testUtils/buildProjectDetailFixture"

type DocumentHook = ReturnType<typeof useProjectDocument>

const ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"
const README: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b0",
    name: "README.md",
    format: "markdown",
    translated: true
}
const SETUP: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b1",
    name: "SETUP.md",
    format: "markdown",
    translated: true
}
const LICENSE: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b2",
    name: "LICENSE",
    format: "text",
    translated: false,
    contentLanguage: "en"
}
const ODD: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b3",
    name: "NOTES.txt",
    format: "markdown",
    translated: true
}

let latest: DocumentHook

function Probe({ project, name }: { project: ProjectDetail; name?: string }) {
    const state = useProjectDocument(project, name)

    useEffect(() => {
        latest = state
    })

    return null
}

function stubFiles(records = [buildProjectRecord({ documents: [README, SETUP, LICENSE, ODD] })]) {
    const files: Record<string, unknown> = {}

    for (const language of ["pt-BR", "en", "es"]) {
        files[`content/${language}/projects.json`] = { items: records }
        files[`content/${language}/projects/${ID}/docs/README.md`] = `README ${language}`
        files[`content/${language}/projects/${ID}/docs/SETUP.md`] = `SETUP ${language}`
        files[`content/${language}/projects/${ID}/docs/NOTES.txt`] = `NOTES ${language}`
    }
    files[`content/shared/projects/${ID}/docs/LICENSE`] = "MIT License"

    return stubContentFetch(files)
}

function mount(name?: string, documents = [README, SETUP, LICENSE, ODD]) {
    const store = createStore()
    const project = buildProjectDetailFixture({ id: ID, documents })
    const view = render(
        <Provider store={store}>
            <Probe project={project} name={name} />
        </Provider>
    )

    return {
        store,
        project,
        rerender: (nextName?: string) =>
            view.rerender(
                <Provider store={store}>
                    <Probe project={project} name={nextName} />
                </Provider>
            )
    }
}

beforeEach(() => {
    window.history.pushState({}, "", "/")
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("useProjectDocument", () => {
    it("sem nome na URL, abre o README.md da lista", async () => {
        stubFiles()
        mount()

        await waitFor(() => expect(latest.status).toBe("success"))
        expect(latest.document?.name).toBe("README.md")
        expect(latest.content).toBe("README pt-BR")
    })

    it("com nome fora da lista, devolve não encontrado sem requisitar conteúdo", async () => {
        const fetchMock = stubFiles()
        mount("OUTRO.md")

        await waitFor(() => expect(latest.status).toBe("notFound"))
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("com README.md em /docs/, devolve não encontrado", async () => {
        stubFiles()
        mount("README.md")

        await waitFor(() => expect(latest.status).toBe("notFound"))
    })

    it("com nome em outra caixa, devolve o nome exato", async () => {
        stubFiles()
        mount("setup.md")

        await waitFor(() => expect(latest.status).toBe("success"))
        expect(latest.exactName).toBe("SETUP.md")
        expect(latest.content).toBe("SETUP pt-BR")
    })

    it("pede o conteúdo uma vez com exatamente { id, documentId, lang } e não pede o projeto ao trocar de documento", async () => {
        stubFiles()
        const { store, rerender } = mount()

        await waitFor(() => expect(latest.status).toBe("success"))
        rerender("SETUP.md")
        await waitFor(() => expect(latest.content).toBe("SETUP pt-BR"))

        const queries = Object.values(store.getState().api.queries).map(
            (query) => query?.endpointName
        )
        expect(queries).toEqual(["getProjectDocumentContent", "getProjectDocumentContent"])
        const args = Object.values(store.getState().api.queries).map((query) => query?.originalArgs)
        expect(args).toContainEqual({ id: ID, documentId: README.id, lang: "pt-BR" })
        expect(args).toContainEqual({ id: ID, documentId: SETUP.id, lang: "pt-BR" })
    })

    it("devolve carregando e depois erro do documento, e retry refaz só o conteúdo", async () => {
        const fetchMock = stubFiles()
        const recover = failFetchAfter(fetchMock, 0)
        mount()

        expect(latest.status).toBe("loading")
        await waitFor(() => expect(latest.status).toBe("error"))

        recover()
        await act(async () => {
            await latest.retry()
        })

        await waitFor(() => expect(latest.status).toBe("success"))
        expect(latest.content).toBe("README pt-BR")
    })

    it("pede o documento em en ao trocar de idioma, sem misturar com pt-BR", async () => {
        stubFiles()
        mount()
        await waitFor(() => expect(latest.content).toBe("README pt-BR"))

        await act(() => setLanguage("en"))

        await waitFor(() => expect(latest.content).toBe("README en"))
    })

    it("expõe format, com formato desconhecido como text, e lang só em documento neutro", async () => {
        stubFiles()
        const odd = { ...ODD, format: parseUntyped('"pdf"') }
        mount("NOTES.txt", [README, SETUP, LICENSE, odd])
        await waitFor(() => expect(latest.status).toBe("success"))
        expect(latest.format).toBe("text")
        expect(latest.lang).toBeUndefined()
    })

    it("documento neutro com contentLanguage expõe format text e lang", async () => {
        stubFiles()
        mount("LICENSE")

        await waitFor(() => expect(latest.status).toBe("success"))
        expect(latest.format).toBe("text")
        expect(latest.lang).toBe("en")
        expect(latest.content).toBe("MIT License")
    })
})
