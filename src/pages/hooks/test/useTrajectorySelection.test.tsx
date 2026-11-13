import type { ReactNode } from "react"
import { MemoryRouter, useNavigate } from "react-router-dom"
import { afterEach, describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import useTrajectorySelection from "@/pages/hooks/useTrajectorySelection"
import buildTimelineItem from "@/testUtils/buildTimelineItem"

const ITEM = buildTimelineItem({ id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c1" })

function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={["/pt-BR/about"]}>{children}</MemoryRouter>
}

function renderSelection() {
    return renderHook(() => ({ selection: useTrajectorySelection(), navigate: useNavigate() }), {
        wrapper: Wrapper
    })
}

function appendButton() {
    const button = document.createElement("button")
    document.body.appendChild(button)

    return button
}

afterEach(() => {
    document.body.innerHTML = ""
})

describe("useTrajectorySelection", () => {
    it("começa sem item selecionado", () => {
        const { result } = renderSelection()

        expect(result.current.selection.selectedItem).toBeNull()
    })

    it("guarda o item ao abrir e o limpa ao fechar", () => {
        const { result } = renderSelection()

        act(() => result.current.selection.open(ITEM))

        expect(result.current.selection.selectedItem).toEqual(ITEM)

        act(() => result.current.selection.close())

        expect(result.current.selection.selectedItem).toBeNull()
    })

    it("mantém a identidade de registerTrigger entre renderizações", () => {
        const { result, rerender } = renderSelection()
        const first = result.current.selection.registerTrigger

        rerender()

        expect(result.current.selection.registerTrigger).toBe(first)
    })

    it("devolve o foco ao gatilho registrado do item ao fechar, mesmo com o foco no body", () => {
        const { result } = renderSelection()
        const button = appendButton()
        act(() => {
            result.current.selection.registerTrigger(ITEM.id)(button)
        })

        act(() => result.current.selection.open(ITEM))

        expect(document.activeElement).toBe(document.body)

        act(() => result.current.selection.close())

        expect(button).toHaveFocus()
    })

    it("não foca o gatilho que foi removido com null", () => {
        const { result } = renderSelection()
        const button = appendButton()
        act(() => {
            result.current.selection.registerTrigger(ITEM.id)(button)
        })
        act(() => {
            result.current.selection.registerTrigger(ITEM.id)(null)
        })

        act(() => result.current.selection.open(ITEM))
        act(() => result.current.selection.close())

        expect(button).not.toHaveFocus()
        expect(document.activeElement).toBe(document.body)
    })

    it("fechar sem gatilho registrado não lança e não foca nada", () => {
        const { result } = renderSelection()

        act(() => result.current.selection.open(ITEM))

        expect(() => act(() => result.current.selection.close())).not.toThrow()
        expect(document.activeElement).toBe(document.body)
    })

    it("fecha o item quando o caminho muda, sem alterar o histórico", () => {
        const { result } = renderSelection()
        const before = window.history.length

        act(() => result.current.selection.open(ITEM))

        expect(result.current.selection.selectedItem).toEqual(ITEM)
        expect(window.history.length).toBe(before)

        act(() => result.current.navigate("/pt-BR/projects"))

        expect(result.current.selection.selectedItem).toBeNull()

        act(() => result.current.navigate("/pt-BR/about"))

        expect(result.current.selection.selectedItem).toBeNull()
    })
})
