import { describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import useShareImage from "@/hooks/useShareImage"
import setLanguage from "@/i18n/setLanguage"

describe("useShareImage", () => {
    it("devolve a imagem e o alt da página no idioma ativo", async () => {
        await setLanguage("es")

        const { result } = renderHook(() => useShareImage("contact"))

        expect(result.current).toEqual({
            image: "images/share/es/contact.png",
            imageAlt: "Gato junto al nombre Luiz Felipe dos Santos y el título Contacto"
        })
    })

    it("acompanha a troca de idioma", async () => {
        const { result } = renderHook(() => useShareImage("home"))

        expect(result.current.image).toBe("images/share/pt-BR/home.png")
        expect(result.current.imageAlt).toBe(
            "Gato ao lado do nome Luiz Felipe dos Santos, do cargo e da stack"
        )

        await act(async () => {
            await setLanguage("en")
        })

        expect(result.current.image).toBe("images/share/en/home.png")
        expect(result.current.imageAlt).toBe(
            "Cat next to the name Luiz Felipe dos Santos, the role and the stack"
        )
    })
})
