import { afterEach, describe, expect, it, vi } from "vitest"
import { Provider } from "react-redux"
import { screen } from "@testing-library/react"
import timelineApi from "@/store/api/timeline.api"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import buildTimelineItemRecord from "@/testUtils/buildTimelineItemRecord"
import parseUntyped from "@/testUtils/parseUntyped"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

type ProbeProps = {
    args: { lang: SupportedLanguage }
    current?: boolean
}

function Probe({ args, current = false }: ProbeProps) {
    const full = timelineApi.useGetTimelineQuery(args, { skip: current })
    const partial = timelineApi.useGetCurrentTimelineQuery(args, { skip: !current })
    const { data, error, isFetching } = current ? partial : full

    return isFetching ? null : <pre data-testid="result">{JSON.stringify({ data, error })}</pre>
}

async function resultOf() {
    const element = await screen.findByTestId("result")
    return JSON.parse(element.textContent ?? "")
}

const project = buildProjectRecord({ id: "0192f1a0-0000-7000-8000-000000000001", title: "Maps" })

function files(lang: string) {
    return {
        [`content/${lang}/projects.json`]: { items: [project] },
        [`content/${lang}/timeline.json`]: {
            items: [
                buildTimelineItemRecord({
                    id: "0192f1b2-0000-7000-8000-000000000001",
                    title: lang === "en" ? "Frontend developer" : "Desenvolvedor frontend",
                    projectIds: [project.id]
                }),
                buildTimelineItemRecord({
                    id: "0192f1b2-0000-7000-8000-000000000002",
                    kind: "education",
                    title: "Análise e Desenvolvimento de Sistemas",
                    organization: "Fatec",
                    start: "2023-02"
                })
            ]
        }
    }
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("timelineApi", () => {
    it("devolve a trajetória agrupada com projects e certificates", async () => {
        stubContentFetch(files("pt-BR"))

        renderWithStore(<Probe args={{ lang: "pt-BR" }} />)

        const { data } = await resultOf()
        expect(data.groups.map((group: { kind: string }) => group.kind)).toEqual([
            "experience",
            "education",
            "course"
        ])
        expect(data.groups[0].items[0].projects).toEqual([{ id: project.id, title: "Maps" }])
        expect(data.groups[2].items).toEqual([])
        expect(data.certificates).toEqual([])
    })

    it("devolve só os itens em curso com current", async () => {
        stubContentFetch(files("pt-BR"))

        renderWithStore(<Probe args={{ lang: "pt-BR" }} current />)

        const { data } = await resultOf()
        expect(data.items.map((item: { kind: string }) => item.kind)).toEqual([
            "experience",
            "education"
        ])
    })

    it("refaz o pedido quando o idioma muda", async () => {
        const fetchMock = stubContentFetch({ ...files("pt-BR"), ...files("en") })

        const { rerender, store } = renderWithStore(<Probe args={{ lang: "pt-BR" }} />)
        await resultOf()
        rerender(
            <Provider store={store}>
                <Probe args={{ lang: "en" }} />
            </Provider>
        )

        await vi.waitFor(async () =>
            expect((await resultOf()).data.groups[0].items[0].title).toBe("Frontend developer")
        )
        expect(fetchMock).toHaveBeenCalledWith("/content/en/timeline.json")
    })

    it("responde 400 para idioma inválido nas duas formas", async () => {
        stubContentFetch({})

        renderWithStore(<Probe args={parseUntyped('{"lang":"fr"}')} current />)

        const { error } = await resultOf()
        expect(error.status).toBe(400)
        expect(error.data.error.code).toBe("UNSUPPORTED_LANGUAGE")
    })

    it("responde FETCH_ERROR quando o arquivo não carrega", async () => {
        stubContentFetch({})

        renderWithStore(<Probe args={{ lang: "es" }} />)

        expect((await resultOf()).error.status).toBe("FETCH_ERROR")
    })
})
