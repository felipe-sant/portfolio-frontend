import type { ReactNode } from "react"
import { Provider } from "react-redux"
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, renderHook, waitFor } from "@testing-library/react"
import useHome from "@/pages/hooks/useHome"
import createStore from "@/store/createStore"
import buildProfile from "@/testUtils/buildProfile"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import buildTimelineItemRecord from "@/testUtils/buildTimelineItemRecord"
import stubContentFetch from "@/testUtils/stubContentFetch"

const FEATURED_ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f51"

const TIMELINE = {
    items: [
        buildTimelineItemRecord({ id: "job", kind: "experience", start: "2024-06" }),
        buildTimelineItemRecord({
            id: "degree",
            kind: "education",
            title: "Tecnólogo",
            start: "2023-02"
        }),
        buildTimelineItemRecord({ id: "old", kind: "course", start: "2020-01", end: "2020-12" })
    ]
}

const BASE_FILES = {
    "content/pt-BR/profile.json": buildProfile(),
    "content/pt-BR/projects.json": {
        items: [
            buildProjectRecord({ id: FEATURED_ID, title: "Destaque", featured: true }),
            buildProjectRecord({ title: "Comum", featured: false })
        ]
    }
}

function renderUseHome() {
    const store = createStore()

    function Wrapper({ children }: { children: ReactNode }) {
        return <Provider store={store}>{children}</Provider>
    }

    return renderHook(() => useHome(), { wrapper: Wrapper })
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("useHome", () => {
    it("começa carregando em todos os blocos", () => {
        stubContentFetch({ ...BASE_FILES, "content/pt-BR/timeline.json": TIMELINE })

        const { result } = renderUseHome()

        expect(result.current.profile.isLoading).toBe(true)
        expect(result.current.status.isLoading).toBe(true)
        expect(result.current.featured.isLoading).toBe(true)
    })

    it("devolve perfil, status e destaques derivados quando carrega", async () => {
        stubContentFetch({ ...BASE_FILES, "content/pt-BR/timeline.json": TIMELINE })

        const { result } = renderUseHome()

        await waitFor(() => expect(result.current.featured.projects).toHaveLength(1))
        await waitFor(() => expect(result.current.profile.intro).toBeDefined())
        await waitFor(() => expect(result.current.status.working).toBeDefined())
        expect(result.current.featured.projects[0].id).toBe(FEATURED_ID)
        expect(result.current.profile.availability?.isAvailable).toBe(true)
        expect(result.current.profile.stack).toEqual([{ name: "TypeScript", isPrimary: true }])
        expect(result.current.status.studying?.id).toBe("degree")
        expect(result.current.status.working?.id).toBe("job")
        expect(result.current.profile.isLoading).toBe(false)
        expect(result.current.featured.isError).toBe(false)
    })

    it("isola o erro por bloco", async () => {
        stubContentFetch(BASE_FILES)

        const { result } = renderUseHome()

        await waitFor(() => expect(result.current.status.isError).toBe(true))
        await waitFor(() => expect(result.current.featured.projects).toHaveLength(1))
        expect(result.current.featured.isError).toBe(false)
        expect(result.current.status.working).toBeUndefined()
    })

    it("refaz só a consulta do bloco no refetch", async () => {
        const failing = stubContentFetch(BASE_FILES)
        const { result } = renderUseHome()
        await waitFor(() => expect(result.current.status.isError).toBe(true))
        await waitFor(() => expect(result.current.featured.projects).toHaveLength(1))

        const recovered = stubContentFetch({
            ...BASE_FILES,
            "content/pt-BR/timeline.json": TIMELINE
        })
        await act(async () => {
            await result.current.status.retry()
        })

        await waitFor(() => expect(result.current.status.working?.id).toBe("job"))
        expect(failing).toHaveBeenCalled()
        const requested = recovered.mock.calls.map(([input]) => String(input))
        expect(requested.some((url) => url.endsWith("timeline.json"))).toBe(true)
        expect(requested.some((url) => url.endsWith("profile.json"))).toBe(false)
        await waitFor(() => expect(result.current.status.isError).toBe(false))
    })

    it("monta o JSON-LD no idioma ativo", () => {
        stubContentFetch({ ...BASE_FILES, "content/pt-BR/timeline.json": TIMELINE })

        const { result } = renderUseHome()

        expect(result.current.language).toBe("pt-BR")
        expect(JSON.stringify(result.current.jsonLd)).toContain("Desenvolvedor full stack")
    })
})
