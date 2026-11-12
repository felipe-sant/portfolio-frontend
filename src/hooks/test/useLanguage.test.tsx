import { afterEach, describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import useLanguage from "@/hooks/useLanguage"
import i18n from "@/i18n/i18n"
import setLanguage from "@/i18n/setLanguage"

describe("useLanguage", () => {
    afterEach(async () => {
        await act(async () => {
            await setLanguage("pt-BR")
        })
    })

    it.each(["pt-BR", "en", "es"] as const)(
        "devolve %s quando é o idioma ativo",
        async (language) => {
            await act(async () => {
                await setLanguage(language)
            })

            const { result } = renderHook(() => useLanguage())

            expect(result.current).toBe(language)
        }
    )

    it("devolve o idioma de reserva quando o idioma ativo não é suportado", async () => {
        await act(async () => {
            await i18n.changeLanguage("fr")
        })

        const { result } = renderHook(() => useLanguage())

        expect(result.current).toBe("en")
    })

    it("atualiza o valor ao trocar o idioma, sem remontar", async () => {
        const { result } = renderHook(() => useLanguage())

        expect(result.current).toBe("pt-BR")

        await act(async () => {
            await setLanguage("es")
        })

        expect(result.current).toBe("es")
    })
})
