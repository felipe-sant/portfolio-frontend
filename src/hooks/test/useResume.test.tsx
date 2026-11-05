import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { MemoryRouter, useNavigate } from "react-router-dom"
import useResume from "@/hooks/useResume"
import setLanguage from "@/i18n/setLanguage"

function wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter>{children}</MemoryRouter>
}

function renderResume() {
    return renderHook(() => ({ resume: useResume(), navigate: useNavigate() }), { wrapper })
}

describe("useResume", () => {
    it("nasce fechado e devolve o href do idioma ativo", () => {
        const { result } = renderResume()

        expect(result.current.resume.isOpen).toBe(false)
        expect(result.current.resume.href).toBe("/cv/cv-pt-BR.pdf")
    })

    it("abre e fecha", () => {
        const { result } = renderResume()
        const trigger = document.createElement("a")

        act(() => result.current.resume.open(trigger))
        expect(result.current.resume.isOpen).toBe(true)

        act(() => result.current.resume.close())
        expect(result.current.resume.isOpen).toBe(false)
    })

    it("devolve o foco ao link de origem ao fechar", () => {
        const { result } = renderResume()
        const trigger = document.createElement("a")
        trigger.href = "/cv/cv-pt-BR.pdf"
        document.body.appendChild(trigger)

        act(() => result.current.resume.open(trigger))
        act(() => result.current.resume.close())

        expect(trigger).toHaveFocus()
        trigger.remove()
    })

    it("atualiza o href quando o idioma muda", async () => {
        const { result } = renderResume()

        await act(async () => {
            await setLanguage("es")
        })

        expect(result.current.resume.href).toBe("/cv/cv-es.pdf")
    })

    it("fecha quando o caminho muda", () => {
        const { result } = renderResume()

        act(() => result.current.resume.open(document.createElement("a")))
        act(() => result.current.navigate("/pt-BR/about"))

        expect(result.current.resume.isOpen).toBe(false)
    })

    it("continua fechado ao voltar ao caminho em que foi aberto", () => {
        const { result } = renderResume()

        act(() => result.current.resume.open(document.createElement("a")))
        act(() => result.current.navigate("/pt-BR/about"))
        act(() => result.current.navigate(-1))

        expect(result.current.resume.isOpen).toBe(false)
    })
})
