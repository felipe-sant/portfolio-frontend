import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import useDebounce from "@/hooks/useDebounce"

beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
})

describe("useDebounce", () => {
    it("devolve o valor inicial na primeira renderização, sem esperar", () => {
        const { result } = renderHook(() => useDebounce("react", 300))

        expect(result.current).toBe("react")
    })

    it("entrega o novo valor só 300 ms depois da última mudança", () => {
        const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
            initialProps: { value: "" }
        })

        rerender({ value: "re" })
        act(() => {
            vi.advanceTimersByTime(299)
        })
        expect(result.current).toBe("")

        act(() => {
            vi.advanceTimersByTime(1)
        })
        expect(result.current).toBe("re")
    })

    it("reinicia a contagem quando o valor muda antes dos 300 ms", () => {
        const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
            initialProps: { value: "" }
        })

        rerender({ value: "re" })
        act(() => {
            vi.advanceTimersByTime(200)
        })
        rerender({ value: "react" })
        act(() => {
            vi.advanceTimersByTime(200)
        })
        expect(result.current).toBe("")

        act(() => {
            vi.advanceTimersByTime(100)
        })
        expect(result.current).toBe("react")
    })

    it("limpa o timer ao desmontar", () => {
        const { rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), {
            initialProps: { value: "" }
        })

        rerender({ value: "re" })
        unmount()

        expect(vi.getTimerCount()).toBe(0)
    })
})
