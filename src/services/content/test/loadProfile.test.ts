import { afterEach, describe, expect, it, vi } from "vitest"
import ContentException from "@/services/content/ContentException"
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

    it("lança INVALID_CONTENT quando o perfil foge do contrato", async () => {
        const profile = buildProfile({
            location: { city: "A", region: "B", countryCode: "brasil" }
        })
        stubContentFetch({ "content/pt-BR/profile.json": profile })

        const error = await loadProfile("pt-BR").catch((caught: unknown) => caught)

        expect(error).toBeInstanceOf(ContentException)
        expect(error).toMatchObject({
            message: expect.stringContaining(
                "O arquivo content/pt-BR/profile.json não segue o contrato: location.countryCode"
            ),
            contentError: {
                status: 500,
                data: {
                    error: {
                        code: "INVALID_CONTENT",
                        fields: [{ field: "location.countryCode" }]
                    }
                }
            }
        })
    })
})
