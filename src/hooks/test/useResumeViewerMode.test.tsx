import { afterEach, describe, expect, it, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import useResumeViewerMode from "@/hooks/useResumeViewerMode"

function stubPointer(coarse: boolean) {
    vi.stubGlobal(
        "matchMedia",
        vi.fn((query: string) => ({
            matches: query === "(pointer: coarse)" && coarse,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        }))
    )
}

function stubPdfViewer(enabled: boolean | undefined) {
    Object.defineProperty(navigator, "pdfViewerEnabled", { value: enabled, configurable: true })
}

afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, "pdfViewerEnabled")
})

describe("useResumeViewerMode", () => {
    it("escolhe canvas quando o navegador não tem visualizador de PDF", () => {
        stubPointer(false)
        stubPdfViewer(false)

        const { result } = renderHook(() => useResumeViewerMode())

        expect(result.current).toBe("canvas")
    })

    it("escolhe canvas com ponteiro grosso mesmo com visualizador", () => {
        stubPointer(true)
        stubPdfViewer(true)

        const { result } = renderHook(() => useResumeViewerMode())

        expect(result.current).toBe("canvas")
    })

    it("escolhe o visualizador nativo com visualizador e ponteiro fino", () => {
        stubPointer(false)
        stubPdfViewer(true)

        const { result } = renderHook(() => useResumeViewerMode())

        expect(result.current).toBe("native")
    })

    it("escolhe o visualizador nativo quando pdfViewerEnabled não existe e o ponteiro é fino", () => {
        stubPointer(false)
        stubPdfViewer(undefined)

        const { result } = renderHook(() => useResumeViewerMode())

        expect(result.current).toBe("native")
    })

    it("escolhe canvas com ponteiro grosso quando pdfViewerEnabled não existe", () => {
        stubPointer(true)
        stubPdfViewer(undefined)

        const { result } = renderHook(() => useResumeViewerMode())

        expect(result.current).toBe("canvas")
    })
})
