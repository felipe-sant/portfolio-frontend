import { afterEach, describe, expect, it, vi } from "vitest"
import projectsApi from "@/store/api/projects.api"
import createStore from "@/store/createStore"
import buildProjectDetailFixture from "@/testUtils/buildProjectDetailFixture"
import shouldPreloadMarkdown from "@/utils/shouldPreloadMarkdown"
import type ProjectDocument from "@/types/project/ProjectDocument.types"

const ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"
const SETUP: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b7",
    name: "SETUP.md",
    format: "markdown",
    translated: true
}
const LICENSE: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b8",
    name: "LICENSE",
    format: "text",
    translated: false,
    contentLanguage: "en"
}

async function buildState() {
    const detail = buildProjectDetailFixture()
    const store = createStore()
    await store.dispatch(
        projectsApi.util.upsertQueryData(
            "getProject",
            { id: ID, lang: "pt-BR" },
            { ...detail, documents: [...detail.documents, SETUP, LICENSE] }
        )
    )

    return store.getState()
}

afterEach(() => {
    vi.unstubAllEnvs()
})

describe("shouldPreloadMarkdown", () => {
    it.each([
        `/pt-BR/projects/${ID}`,
        `/en/projects/${ID}/docs/SETUP.md`,
        `/en/projects/${ID}/docs/setup.md`
    ])("é verdadeiro para %s, cujo documento aberto é markdown", async (path) => {
        expect(shouldPreloadMarkdown(path, await buildState())).toBe(true)
    })

    it("é falso para um documento de texto", async () => {
        expect(
            shouldPreloadMarkdown(`/pt-BR/projects/${ID}/docs/LICENSE`, await buildState())
        ).toBe(false)
    })

    it.each(["/pt-BR", "/pt-BR/projects", "/pt-BR/about", `/pt-BR/projects/${ID}/outra`])(
        "é falso para %s, que não é projeto",
        async (path) => {
            expect(shouldPreloadMarkdown(path, await buildState())).toBe(false)
        }
    )

    it("é falso sem estado, com estado de outro projeto e para documento fora da lista", async () => {
        expect(shouldPreloadMarkdown(`/pt-BR/projects/${ID}`, undefined)).toBe(false)
        expect(shouldPreloadMarkdown(`/pt-BR/projects/${ID}`, {})).toBe(false)
        expect(
            shouldPreloadMarkdown(
                "/pt-BR/projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f51",
                await buildState()
            )
        ).toBe(false)
        expect(
            shouldPreloadMarkdown(`/pt-BR/projects/${ID}/docs/OUTRO.md`, await buildState())
        ).toBe(false)
    })

    it("tira o caminho base antes de ler o projeto", async () => {
        vi.stubEnv("BASE_URL", "/ra2581392423047/")

        expect(
            shouldPreloadMarkdown(`/ra2581392423047/pt-BR/projects/${ID}`, await buildState())
        ).toBe(true)
    })
})
