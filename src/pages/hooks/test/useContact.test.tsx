import type { ReactNode } from "react"
import { Provider } from "react-redux"
import { afterEach, describe, expect, it, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import useContact from "@/pages/hooks/useContact"
import createStore from "@/store/createStore"
import buildProfile from "@/testUtils/buildProfile"
import stubContentFetch from "@/testUtils/stubContentFetch"

function renderUseContact() {
    const store = createStore()

    function Wrapper({ children }: { children: ReactNode }) {
        return <Provider store={store}>{children}</Provider>
    }

    return { store, ...renderHook(() => useContact(), { wrapper: Wrapper }) }
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("useContact", () => {
    it("lê o perfil pelo endpoint do RTK Query, uma consulta por idioma, e não lê mais nada", async () => {
        const profile = buildProfile()
        const fetchMock = stubContentFetch({ "content/pt-BR/profile.json": profile })

        const { result, store } = renderUseContact()

        await waitFor(() => expect(result.current.profile).toEqual(profile))
        expect(store.getState().api.queries['getProfile({"lang":"pt-BR"})']?.data).toEqual(profile)
        expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual([
            expect.stringMatching(/content\/pt-BR\/profile\.json$/)
        ])
    })

    it("marca erro quando o perfil não carrega", async () => {
        stubContentFetch({})

        const { result } = renderUseContact()

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.profile).toBeUndefined()
    })
})
