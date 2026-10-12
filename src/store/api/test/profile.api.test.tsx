import { afterEach, describe, expect, it, vi } from "vitest"
import { Provider } from "react-redux"
import { screen } from "@testing-library/react"
import profileApi from "@/store/api/profile.api"
import buildProfile from "@/testUtils/buildProfile"
import parseUntyped from "@/testUtils/parseUntyped"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

type ProbeProps = {
    args: { lang: SupportedLanguage }
}

function Probe({ args }: ProbeProps) {
    const { data, error, isFetching } = profileApi.useGetProfileQuery(args)

    return isFetching ? null : <pre data-testid="result">{JSON.stringify({ data, error })}</pre>
}

async function resultOf() {
    const element = await screen.findByTestId("result")
    return JSON.parse(element.textContent ?? "")
}

afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe("profileApi", () => {
    it("devolve o perfil do idioma pedido", async () => {
        const profile = buildProfile()
        const fetchMock = stubContentFetch({ "content/pt-BR/profile.json": profile })

        renderWithStore(<Probe args={{ lang: "pt-BR" }} />)

        expect((await resultOf()).data).toEqual(profile)
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(fetchMock).toHaveBeenCalledWith("/content/pt-BR/profile.json")
    })

    it("refaz o pedido quando o idioma muda", async () => {
        const fetchMock = stubContentFetch({
            "content/pt-BR/profile.json": buildProfile({ role: "Desenvolvedor" }),
            "content/en/profile.json": buildProfile({ role: "Developer" })
        })

        const { rerender, store } = renderWithStore(<Probe args={{ lang: "pt-BR" }} />)
        expect((await resultOf()).data.role).toBe("Desenvolvedor")

        rerender(
            <Provider store={store}>
                <Probe args={{ lang: "en" }} />
            </Provider>
        )

        await vi.waitFor(async () => expect((await resultOf()).data.role).toBe("Developer"))
        expect(fetchMock).toHaveBeenCalledWith("/content/en/profile.json")
    })

    it("responde 400 UNSUPPORTED_LANGUAGE para idioma inválido", async () => {
        const fetchMock = stubContentFetch({})

        renderWithStore(<Probe args={parseUntyped('{"lang":"fr"}')} />)

        const { error } = await resultOf()
        expect(error.status).toBe(400)
        expect(error.data.error.code).toBe("UNSUPPORTED_LANGUAGE")
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("responde FETCH_ERROR quando o arquivo não carrega", async () => {
        stubContentFetch({})

        renderWithStore(<Probe args={{ lang: "es" }} />)

        const { error } = await resultOf()
        expect(error.status).toBe("FETCH_ERROR")
        expect(error.error).toContain("content/es/profile.json")
    })

    it("pede o arquivo com o prefixo do GitHub Pages e não chama a API", async () => {
        vi.stubEnv("BASE_URL", "/ra2581392423047/")
        vi.stubEnv("VITE_API_URL", "https://api.example.com")
        vi.resetModules()
        const { default: freshApi } = await import("@/store/api/profile.api")
        const { default: freshRender } = await import("@/testUtils/renderWithStore")
        const fetchMock = stubContentFetch({ "content/en/profile.json": buildProfile() })

        function FreshProbe() {
            const { data } = freshApi.useGetProfileQuery({ lang: "en" })
            return <p>{data?.role}</p>
        }

        freshRender(<FreshProbe />)

        expect(await screen.findByText("Desenvolvedor full stack")).toBeInTheDocument()
        expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
            "/ra2581392423047/content/en/profile.json"
        ])
    })
})
