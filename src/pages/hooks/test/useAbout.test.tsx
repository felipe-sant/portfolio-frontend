import type { ReactNode } from "react"
import { Provider } from "react-redux"
import { MemoryRouter, useNavigate } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, renderHook, waitFor } from "@testing-library/react"
import getLanguage from "@/i18n/getLanguage"
import setLanguage from "@/i18n/setLanguage"
import useAbout from "@/pages/hooks/useAbout"
import profileApi from "@/store/api/profile.api"
import timelineApi from "@/store/api/timeline.api"
import createStore from "@/store/createStore"
import buildProfile from "@/testUtils/buildProfile"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import buildTimelineItemRecord from "@/testUtils/buildTimelineItemRecord"
import stubContentFetch from "@/testUtils/stubContentFetch"
import parseUntyped from "@/testUtils/parseUntyped"

const PROJECT_ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"

const TIMELINE = {
    items: [
        buildTimelineItemRecord({
            id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c1",
            kind: "experience",
            projectIds: [PROJECT_ID]
        }),
        buildTimelineItemRecord({
            id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c2",
            kind: "education",
            title: "Tecnólogo",
            certificates: [{ id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5d1", name: "Certificado A" }]
        })
    ]
}

const PROFILE = buildProfile({
    stack: [
        { category: "tooling", items: [{ name: "Docker" }] },
        { category: "frontend", items: [{ name: "React" }] },
        { category: "backend", items: [] }
    ]
})

const FILES = {
    "content/pt-BR/profile.json": PROFILE,
    "content/pt-BR/timeline.json": TIMELINE,
    "content/pt-BR/projects.json": { items: [buildProjectRecord({ id: PROJECT_ID })] }
}

function renderUseAbout(store = createStore(), initialPath = "/pt-BR/about") {
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <Provider store={store}>
                <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
            </Provider>
        )
    }

    return {
        store,
        ...renderHook(() => ({ about: useAbout(), navigate: useNavigate() }), {
            wrapper: Wrapper
        })
    }
}

afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ""
})

describe("useAbout", () => {
    it("consulta só o perfil e a trajetória com o idioma ativo", async () => {
        stubContentFetch(FILES)
        const { result, store } = renderUseAbout()

        await waitFor(() => expect(result.current.about.isLoading).toBe(false))
        const queries = Object.values(store.getState().api.queries)

        expect(queries.map((query) => query?.endpointName).toSorted()).toEqual([
            "getProfile",
            "getTimeline"
        ])
        expect(queries.map((query) => query?.originalArgs)).toEqual([
            { lang: "pt-BR" },
            { lang: "pt-BR" }
        ])
    })

    it("carrega o idioma novo ao trocar com setLanguage", async () => {
        stubContentFetch({
            ...FILES,
            "content/en/profile.json": buildProfile({ summary: "Full stack developer." }),
            "content/en/timeline.json": { items: [] },
            "content/en/projects.json": { items: [] }
        })
        const { result } = renderUseAbout()
        await waitFor(() => expect(result.current.about.isLoading).toBe(false))

        await act(() => setLanguage("en"))

        await waitFor(() =>
            expect(result.current.about.profile.data?.summary).toBe("Full stack developer.")
        )
        expect(getLanguage()).toBe("en")
    })

    it("não faz nova requisição quando a store já vem hidratada", async () => {
        stubContentFetch(FILES)
        const source = createStore()
        await source.dispatch(profileApi.endpoints.getProfile.initiate({ lang: "pt-BR" }))
        await source.dispatch(timelineApi.endpoints.getTimeline.initiate({ lang: "pt-BR" }))
        const fetchMock = stubContentFetch(FILES)

        const { result } = renderUseAbout(createStore(source.getState()))

        expect(result.current.about.isLoading).toBe(false)
        expect(result.current.about.profile.data).toBeDefined()
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("começa carregando e termina quando as duas fontes chegam", async () => {
        stubContentFetch(FILES)
        const { result } = renderUseAbout()

        expect(result.current.about.isLoading).toBe(true)
        await waitFor(() => expect(result.current.about.isLoading).toBe(false))
    })

    it("ordena a stack, descarta grupo vazio e mantém os grupos da trajetória com item", async () => {
        stubContentFetch(FILES)
        const { result } = renderUseAbout()

        await waitFor(() => expect(result.current.about.isLoading).toBe(false))
        const { content, timeline } = result.current.about

        expect(content.stackGroups.map((group) => group.category)).toEqual(["frontend", "tooling"])
        expect(timeline.groups.map((group) => group.kind)).toEqual(["experience", "education"])
        expect(timeline.certificates.map((certificate) => certificate.name)).toEqual([
            "Certificado A"
        ])
    })

    it("marca erro na trajetória quando um item tem tipo fora do contrato", async () => {
        const unknownGroup = parseUntyped(
            JSON.stringify({
                items: [{ ...TIMELINE.items[0], kind: "volunteer" }, { ...TIMELINE.items[1] }]
            })
        )
        stubContentFetch({ ...FILES, "content/pt-BR/timeline.json": unknownGroup })
        const { result } = renderUseAbout()

        await waitFor(() => expect(result.current.about.timeline.isError).toBe(true))

        expect(result.current.about.profile.isError).toBe(false)
        expect(result.current.about.timeline.groups).toEqual([])
    })

    it("esconde as seções sem dado e a faixa de complementos com as duas colunas vazias", async () => {
        stubContentFetch({
            ...FILES,
            "content/pt-BR/profile.json": buildProfile({ stack: [], workPrinciples: [] }),
            "content/pt-BR/timeline.json": { items: [] }
        })
        const { result } = renderUseAbout()

        await waitFor(() => expect(result.current.about.isLoading).toBe(false))
        const { show } = result.current.about

        expect(show.stack).toBe(false)
        expect(show.trajectory).toBe(false)
        expect(show.certificates).toBe(false)
        expect(show.workStyle).toBe(false)
        expect(show.complements).toBe(false)
    })

    it("isola o erro por fonte", async () => {
        stubContentFetch({ "content/pt-BR/profile.json": PROFILE })
        const { result } = renderUseAbout()

        await waitFor(() => expect(result.current.about.timeline.isError).toBe(true))

        expect(result.current.about.profile.isError).toBe(false)
        expect(result.current.about.profile.data).toBeDefined()
    })

    it("refaz só a fonte do retry e foca o título quando dá certo", async () => {
        stubContentFetch({ "content/pt-BR/profile.json": PROFILE })
        const { result } = renderUseAbout()
        await waitFor(() => expect(result.current.about.timeline.isError).toBe(true))
        const { ids } = result.current.about
        const heading = document.createElement("h2")
        heading.id = ids.timelineHeading
        heading.tabIndex = -1
        document.body.appendChild(heading)

        const recovered = stubContentFetch(FILES)
        await act(async () => {
            await result.current.about.timeline.retry()
        })

        await waitFor(() => expect(result.current.about.timeline.isError).toBe(false))
        const requested = recovered.mock.calls.map(([input]) => String(input))

        expect(requested.some((url) => url.endsWith("timeline.json"))).toBe(true)
        expect(requested.some((url) => url.endsWith("profile.json"))).toBe(false)
        expect(heading).toHaveFocus()
    })

    it("refaz só o perfil no retry do perfil e foca o alerta se falhar de novo", async () => {
        stubContentFetch({
            "content/pt-BR/timeline.json": TIMELINE,
            "content/pt-BR/projects.json": FILES["content/pt-BR/projects.json"]
        })
        const { result } = renderUseAbout()
        await waitFor(() => expect(result.current.about.profile.isError).toBe(true))
        const alert = document.createElement("div")
        alert.id = result.current.about.ids.profileAlert
        alert.tabIndex = -1
        document.body.appendChild(alert)

        const stillFailing = stubContentFetch({})
        await act(async () => {
            await result.current.about.profile.retry()
        })

        const requested = stillFailing.mock.calls.map(([input]) => String(input))

        expect(requested.some((url) => url.endsWith("profile.json"))).toBe(true)
        expect(requested.some((url) => url.endsWith("timeline.json"))).toBe(false)
        expect(alert).toHaveFocus()
    })

    it("foca o alerta da trajetória quando o retry da trajetória falha de novo", async () => {
        stubContentFetch({ "content/pt-BR/profile.json": PROFILE })
        const { result } = renderUseAbout()
        await waitFor(() => expect(result.current.about.timeline.isError).toBe(true))
        const alert = document.createElement("div")
        alert.id = result.current.about.ids.timelineAlert
        alert.tabIndex = -1
        document.body.appendChild(alert)

        stubContentFetch({ "content/pt-BR/profile.json": PROFILE })
        await act(async () => {
            await result.current.about.timeline.retry()
        })

        expect(alert).toHaveFocus()
    })

    it("foca o título do perfil quando o retry do perfil dá certo", async () => {
        stubContentFetch({
            "content/pt-BR/timeline.json": TIMELINE,
            "content/pt-BR/projects.json": FILES["content/pt-BR/projects.json"]
        })
        const { result } = renderUseAbout()
        await waitFor(() => expect(result.current.about.profile.isError).toBe(true))
        const heading = document.createElement("h1")
        heading.id = result.current.about.ids.profileHeading
        heading.tabIndex = -1
        document.body.appendChild(heading)

        stubContentFetch(FILES)
        await act(async () => {
            await result.current.about.profile.retry()
        })

        await waitFor(() => expect(result.current.about.profile.isError).toBe(false))
        expect(heading).toHaveFocus()
    })

    it("não refoca depois de tratado o retry quando outra fonte volta a buscar", async () => {
        stubContentFetch({ "content/pt-BR/profile.json": PROFILE })
        const { result, store } = renderUseAbout()
        await waitFor(() => expect(result.current.about.timeline.isError).toBe(true))
        const heading = document.createElement("h2")
        heading.id = result.current.about.ids.timelineHeading
        heading.tabIndex = -1
        document.body.appendChild(heading)

        stubContentFetch(FILES)
        await act(async () => {
            await result.current.about.timeline.retry()
        })
        await waitFor(() => expect(heading).toHaveFocus())
        heading.blur()

        await act(async () => {
            await store.dispatch(
                profileApi.endpoints.getProfile.initiate({ lang: "pt-BR" }, { forceRefetch: true })
            )
        })

        expect(heading).not.toHaveFocus()
    })

    it("abre e fecha o item e devolve o foco ao botão guardado, mesmo com o foco no body", async () => {
        stubContentFetch(FILES)
        const { result } = renderUseAbout()
        await waitFor(() => expect(result.current.about.isLoading).toBe(false))
        const item = result.current.about.timeline.groups[0].items[0]
        const button = document.createElement("button")
        document.body.appendChild(button)
        act(() => {
            result.current.about.trajectory.registerTrigger(item.id)(button)
        })

        act(() => result.current.about.trajectory.open(item))

        expect(result.current.about.trajectory.selectedItem).toEqual(item)
        expect(document.activeElement).toBe(document.body)

        act(() => result.current.about.trajectory.close())

        expect(result.current.about.trajectory.selectedItem).toBeNull()
        await waitFor(() => expect(button).toHaveFocus())
    })

    it("fecha o item quando o caminho muda, sem mexer no histórico", async () => {
        stubContentFetch(FILES)
        const { result } = renderUseAbout()
        await waitFor(() => expect(result.current.about.isLoading).toBe(false))
        const item = result.current.about.timeline.groups[0].items[0]
        const before = window.history.length

        act(() => result.current.about.trajectory.open(item))
        expect(result.current.about.trajectory.selectedItem).toEqual(item)
        expect(window.history.length).toBe(before)

        act(() => result.current.navigate("/pt-BR/projects"))

        expect(result.current.about.trajectory.selectedItem).toBeNull()

        act(() => result.current.navigate("/pt-BR/about"))

        expect(result.current.about.trajectory.selectedItem).toBeNull()
    })

    it("monta o JSON-LD com os dados carregados", async () => {
        stubContentFetch(FILES)
        const { result } = renderUseAbout()

        await waitFor(() => expect(result.current.about.isLoading).toBe(false))
        const serialized = JSON.stringify(result.current.about.jsonLd)

        expect(serialized).toContain("ProfilePage")
        expect(serialized).toContain("Certificado A")
        expect(serialized).toContain("Docker")
    })

    it("monta o caminho de Entrar em contato com o prefixo do idioma e não expõe caminho de CV", () => {
        stubContentFetch(FILES)
        const { result } = renderUseAbout()

        expect(result.current.about.paths.contact).toBe("/pt-BR/contact")
        expect(Object.keys(result.current.about.paths)).toEqual(["contact"])
    })
})
