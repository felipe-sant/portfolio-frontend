import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import useCopyToClipboard from "@/hooks/useCopyToClipboard"

function stubClipboard(writeText: (text: string) => Promise<void>) {
    vi.stubGlobal("navigator", { clipboard: { writeText } })
}

beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

describe("useCopyToClipboard", () => {
    it("começa em idle", () => {
        stubClipboard(vi.fn().mockResolvedValue(undefined))

        const { result } = renderHook(() => useCopyToClipboard())

        expect(result.current.status).toBe("idle")
    })

    it("copia o texto e muda para copied", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined)
        stubClipboard(writeText)
        const { result } = renderHook(() => useCopyToClipboard())

        await act(async () => {
            await result.current.copy("contato@example.com")
        })

        expect(writeText).toHaveBeenCalledWith("contato@example.com")
        expect(result.current.status).toBe("copied")
    })

    it("muda para failed quando writeText rejeita", async () => {
        stubClipboard(vi.fn().mockRejectedValue(new Error("negado")))
        const { result } = renderHook(() => useCopyToClipboard())

        await act(async () => {
            await result.current.copy("a")
        })

        expect(result.current.status).toBe("failed")
    })

    it("muda para failed quando navigator.clipboard não existe", async () => {
        vi.stubGlobal("navigator", {})
        const { result } = renderHook(() => useCopyToClipboard())

        await act(async () => {
            await result.current.copy("a")
        })

        expect(result.current.status).toBe("failed")
    })

    it("volta para idle aos 2200 ms e não antes", async () => {
        stubClipboard(vi.fn().mockResolvedValue(undefined))
        const { result } = renderHook(() => useCopyToClipboard())

        await act(async () => {
            await result.current.copy("a")
        })
        act(() => {
            vi.advanceTimersByTime(2199)
        })

        expect(result.current.status).toBe("copied")

        act(() => {
            vi.advanceTimersByTime(1)
        })

        expect(result.current.status).toBe("idle")
    })

    it("reinicia o prazo em uma nova cópia", async () => {
        stubClipboard(vi.fn().mockResolvedValue(undefined))
        const { result } = renderHook(() => useCopyToClipboard())

        await act(async () => {
            await result.current.copy("a")
        })
        act(() => {
            vi.advanceTimersByTime(2000)
        })
        await act(async () => {
            await result.current.copy("a")
        })
        act(() => {
            vi.advanceTimersByTime(2000)
        })

        expect(result.current.status).toBe("copied")

        act(() => {
            vi.advanceTimersByTime(200)
        })

        expect(result.current.status).toBe("idle")
    })

    it("limpa o timer ao desmontar", async () => {
        stubClipboard(vi.fn().mockResolvedValue(undefined))
        const { result, unmount } = renderHook(() => useCopyToClipboard())

        await act(async () => {
            await result.current.copy("a")
        })
        unmount()

        expect(vi.getTimerCount()).toBe(0)
    })
})
