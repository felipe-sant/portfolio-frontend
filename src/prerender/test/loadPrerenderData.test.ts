import { afterEach, describe, expect, it, vi } from "vitest"
import loadPrerenderData from "@/prerender/loadPrerenderData"
import createStore from "@/store/createStore"
import buildProfile from "@/testUtils/buildProfile"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type PrerenderRoute from "@/types/prerender/PrerenderRoute.types"

const homeRoute: PrerenderRoute = { pattern: "", scope: "none", queries: () => [] }

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("loadPrerenderData", () => {
    it("coloca o perfil do rodapé na store", async () => {
        const profile = buildProfile()
        stubContentFetch({ "content/pt-BR/profile.json": profile })
        const store = createStore()

        await loadPrerenderData(store, homeRoute, {}, "pt-BR")

        expect(store.getState().api.queries['getProfile({"lang":"pt-BR"})']?.data).toEqual(profile)
    })

    it("não deixa assinatura ativa ao final", async () => {
        stubContentFetch({ "content/en/profile.json": buildProfile() })
        const store = createStore()

        await loadPrerenderData(store, homeRoute, {}, "en")
        await new Promise((resolve) => setTimeout(resolve, 600))

        expect(store.getState().api.subscriptions).toEqual({
            'getProfile({"lang":"en"})': {}
        })
    })

    it("carrega só o perfil do rodapé quando a rota não está no registro", async () => {
        const profile = buildProfile()
        stubContentFetch({ "content/en/profile.json": profile })
        const store = createStore()

        await loadPrerenderData(store, undefined, {}, "en")

        expect(store.getState().api.queries['getProfile({"lang":"en"})']?.data).toEqual(profile)
    })

    it("rejeita em português com a rota e a causa quando uma consulta falha", async () => {
        stubContentFetch({})
        const store = createStore()

        await expect(loadPrerenderData(store, homeRoute, {}, "es")).rejects.toThrow(
            /Falha ao carregar os dados da rota "" \(es\)/
        )
    })
})
