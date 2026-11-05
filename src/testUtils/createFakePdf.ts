import { vi } from "vitest"
import type PdfRenderTask from "@/types/resume/PdfRenderTask.types"

type FakePdfOptions = {
    pages?: number
    pageWidth?: number
    pageHeight?: number
    holdLoad?: boolean
    failLoad?: boolean
    failPageNumber?: number
    failRender?: boolean
}

function createFakePdf({
    pages = 2,
    pageWidth = 600,
    pageHeight = 800,
    holdLoad = false,
    failLoad = false,
    failPageNumber = 0,
    failRender = false
}: FakePdfOptions = {}) {
    const cancelRender = vi.fn()
    const render = vi.fn((): PdfRenderTask => {
        const promise = failRender ? Promise.reject(new Error("render")) : Promise.resolve()
        promise.catch(() => undefined)

        return { promise, cancel: cancelRender }
    })
    const getPage = vi.fn(async (pageNumber: number) => {
        if (pageNumber === failPageNumber) {
            throw new Error("page")
        }

        return {
            getViewport: ({ scale }: { scale: number }) => ({
                width: pageWidth * scale,
                height: pageHeight * scale
            }),
            render
        }
    })
    const document = { numPages: pages, getPage }
    const control = {
        resolveLoad: () => {},
        rejectLoad: (_error: Error) => {}
    }
    const destroy = vi.fn(async () => {
        control.rejectLoad(new Error("destroyed"))
    })
    const openDocument = vi.fn(() => {
        const promise = new Promise<typeof document>((resolve, reject) => {
            control.resolveLoad = () => resolve(document)
            control.rejectLoad = reject
        })
        promise.catch(() => undefined)

        if (failLoad) {
            control.rejectLoad(new Error("load"))
        } else if (!holdLoad) {
            control.resolveLoad()
        }

        return { promise, destroy }
    })

    return {
        openDocument,
        document,
        getPage,
        render,
        cancelRender,
        destroy,
        release: () => control.resolveLoad()
    }
}

export default createFakePdf
