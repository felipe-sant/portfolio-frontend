import { afterEach, describe, expect, it, vi } from "vitest"
import loadProfile from "@/services/content/loadProfile"
import buildProfile from "@/testUtils/buildProfile"
import stubContentFetch from "@/testUtils/stubContentFetch"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("loadProfile", () => {
    it("lê o perfil do idioma pedido", async () => {
        const profile = buildProfile({ role: "Full stack developer" })
        const fetchMock = stubContentFetch({ "content/en/profile.json": profile })

        await expect(loadProfile("en")).resolves.toEqual(profile)
        expect(fetchMock).toHaveBeenCalledWith("/content/en/profile.json")
    })

    it("falha quando o arquivo não existe", async () => {
        stubContentFetch({})

        await expect(loadProfile("es")).rejects.toThrow("status 404")
    })
})
