import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, renderHook, waitFor } from "@testing-library/react"
import usePdfPages from "@/hooks/usePdfPages"
import createFakePdf from "@/testUtils/createFakePdf"
import loadPdfRenderer from "@/utils/loadPdfRenderer"

vi.mock("@/utils/loadPdfRenderer", () => ({ default: vi.fn() }))

type ObserverCallback = () => void

let observerCallback: ObserverCallback = () => undefined

function createRegion(width: number) {
    const region = document.createElement("div")
    Object.defineProperty(region, "clientWidth", { value: width, configurable: true })

    return region
}

function mountCanvases(
    result: { current: ReturnType<typeof usePdfPages> },
    count: number,
    region: HTMLElement = createRegion(0)
) {
    act(() => {
        result.current.attachRegion(region)
    })

    return Array.from({ length: count }, (_, index) => {
        const canvas = document.createElement("canvas")
        result.current.registerCanvas(index)(canvas)

        return canvas
    })
}

beforeEach(() => {
    vi.stubGlobal(
        "ResizeObserver",
        class {
            constructor(callback: ObserverCallback) {
                observerCallback = callback
            }
            observe() {}
            disconnect() {}
        }
    )
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.mocked(loadPdfRenderer).mockReset()
})

describe("usePdfPages", () => {
    it("começa carregando e fica pronto depois que a primeira página é desenhada", async () => {
        const fake = createFakePdf({ pages: 2 })
        vi.mocked(loadPdfRenderer).mockResolvedValue(fake.openDocument)

        const { result } = renderHook(() => usePdfPages("/cv/cv-pt-BR.pdf"))
        expect(result.current.status).toBe("loading")
        mountCanvases(result, 2)

        await waitFor(() => expect(result.current.status).toBe("ready"))
        expect(result.current.pageCount).toBe(2)
        expect(fake.openDocument).toHaveBeenCalledWith("/cv/cv-pt-BR.pdf")
        await waitFor(() => expect(fake.render).toHaveBeenCalledTimes(2))
    })

    it("desenha a primeira página antes das demais", async () => {
        const fake = createFakePdf({ pages: 3 })
        vi.mocked(loadPdfRenderer).mockResolvedValue(fake.openDocument)

        const { result } = renderHook(() => usePdfPages("/cv/cv-pt-BR.pdf"))
        mountCanvases(result, 3)

        await waitFor(() => expect(fake.render).toHaveBeenCalledTimes(3))
        expect(fake.getPage.mock.calls.map(([number]) => number)).toEqual([1, 2, 3])
    })

    it.each([
        [
            "o carregador rejeita",
            () => vi.mocked(loadPdfRenderer).mockRejectedValue(new Error("x"))
        ],
        [
            "o PDF não abre",
            () =>
                vi
                    .mocked(loadPdfRenderer)
                    .mockResolvedValue(createFakePdf({ failLoad: true }).openDocument)
        ],
        [
            "getPage rejeita",
            () =>
                vi
                    .mocked(loadPdfRenderer)
                    .mockResolvedValue(createFakePdf({ failPageNumber: 1 }).openDocument)
        ],
        [
            "render rejeita",
            () =>
                vi
                    .mocked(loadPdfRenderer)
                    .mockResolvedValue(createFakePdf({ failRender: true }).openDocument)
        ]
    ])("vira erro quando %s", async (_name, arrange) => {
        arrange()

        const { result } = renderHook(() => usePdfPages("/cv/cv-pt-BR.pdf"))
        mountCanvases(result, 2)

        await waitFor(() => expect(result.current.status).toBe("error"))
    })

    it("cancela o carregamento ao desmontar, sem erro nem aviso", async () => {
        const fake = createFakePdf({ holdLoad: true })
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)
        vi.mocked(loadPdfRenderer).mockResolvedValue(fake.openDocument)

        const { unmount } = renderHook(() => usePdfPages("/cv/cv-pt-BR.pdf"))
        await waitFor(() => expect(fake.openDocument).toHaveBeenCalledTimes(1))
        unmount()
        await act(async () => {
            await Promise.resolve()
        })

        expect(fake.destroy).toHaveBeenCalledTimes(1)
        expect(consoleError).not.toHaveBeenCalled()
        consoleError.mockRestore()
    })

    it("cancela a renderização em andamento ao desmontar", async () => {
        const fake = createFakePdf({ pages: 1 })
        vi.mocked(loadPdfRenderer).mockResolvedValue(fake.openDocument)

        const { result, unmount } = renderHook(() => usePdfPages("/cv/cv-pt-BR.pdf"))
        mountCanvases(result, 1)
        await waitFor(() => expect(fake.render).toHaveBeenCalledTimes(1))
        unmount()

        expect(fake.cancelRender).toHaveBeenCalled()
    })

    it("desenha de novo na nova largura sem abrir o PDF outra vez", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true })
        const fake = createFakePdf({ pages: 1, pageWidth: 600 })
        vi.mocked(loadPdfRenderer).mockResolvedValue(fake.openDocument)
        const region = createRegion(300)

        const { result } = renderHook(() => usePdfPages("/cv/cv-pt-BR.pdf"))
        const [canvas] = mountCanvases(result, 1, region)
        await waitFor(() => expect(fake.render).toHaveBeenCalledTimes(1))
        const widthBefore = canvas?.width

        Object.defineProperty(region, "clientWidth", { value: 600, configurable: true })
        act(() => {
            observerCallback()
        })
        await act(async () => {
            await vi.advanceTimersByTimeAsync(200)
        })
        await waitFor(() => expect(fake.render).toHaveBeenCalledTimes(2))

        expect(fake.openDocument).toHaveBeenCalledTimes(1)
        expect(canvas?.width).toBeGreaterThan(widthBefore ?? 0)
        vi.useRealTimers()
    })

    it.each([
        [1, 300],
        [2, 600],
        [5, 900]
    ])(
        "com devicePixelRatio %s desenha o canvas com %s pixels de largura para uma região de 300 pixels",
        async (ratio, expectedWidth) => {
            vi.stubGlobal("devicePixelRatio", ratio)
            const fake = createFakePdf({ pages: 1, pageWidth: 600 })
            vi.mocked(loadPdfRenderer).mockResolvedValue(fake.openDocument)

            const { result } = renderHook(() => usePdfPages("/cv/cv-pt-BR.pdf"))
            const [canvas] = mountCanvases(result, 1, createRegion(300))

            await waitFor(() => expect(fake.render).toHaveBeenCalledTimes(1))
            expect(canvas?.width).toBe(expectedWidth)
        }
    )
})
