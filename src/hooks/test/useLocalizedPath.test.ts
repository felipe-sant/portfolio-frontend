import { describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import setLanguage from "@/i18n/setLanguage"
import ROUTES from "@/routers/paths"

describe("useLocalizedPath", () => {
    it("monta o caminho no idioma ativo e acompanha a troca de idioma", async () => {
        const { result } = renderHook(() => useLocalizedPath())

        expect(result.current(ROUTES.home)).toBe("/pt-BR")

        await act(async () => {
            await setLanguage("en")
        })

        expect(result.current(ROUTES.home)).toBe("/en")
    })

    it("substitui os parâmetros do caminho", () => {
        const { result } = renderHook(() => useLocalizedPath())

        expect(result.current("/projects/:id", { id: "0190-abc" })).toBe("/pt-BR/projects/0190-abc")
    })
})
