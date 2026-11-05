import { useCallback, useEffect, useRef, useState } from "react"
import useDebounce from "@/hooks/useDebounce"
import type PdfDocument from "@/types/resume/PdfDocument.types"
import type PdfLoadingTask from "@/types/resume/PdfLoadingTask.types"
import type PdfRenderTask from "@/types/resume/PdfRenderTask.types"
import loadPdfRenderer from "@/utils/loadPdfRenderer"

const MAX_OUTPUT_SCALE = 3
const RESIZE_DELAY = 150

function usePdfPages(url: string) {
    const [pdfDocument, setPdfDocument] = useState<PdfDocument | null>(null)
    const [hasFailed, setHasFailed] = useState(false)
    const [hasPainted, setHasPainted] = useState(false)
    const [region, setRegion] = useState<HTMLElement | null>(null)
    const [width, setWidth] = useState(0)
    const canvases = useRef<(HTMLCanvasElement | null)[]>([])
    const lastPaint = useRef<Promise<void>>(Promise.resolve())
    const debouncedWidth = useDebounce(width, RESIZE_DELAY)
    const renderWidth = debouncedWidth || width

    useEffect(() => {
        let isCancelled = false
        let task: PdfLoadingTask | undefined

        loadPdfRenderer()
            .then(async (openDocument) => {
                if (isCancelled) {
                    return
                }

                task = openDocument(url)
                const loaded = await task.promise

                if (!isCancelled) {
                    setPdfDocument(loaded)
                }
            })
            .catch(() => {
                if (!isCancelled) {
                    setHasFailed(true)
                }
            })

        return () => {
            isCancelled = true
            task?.destroy().catch(() => undefined)
        }
    }, [url])

    useEffect(() => {
        if (!region || typeof ResizeObserver === "undefined") {
            return
        }

        const observer = new ResizeObserver(() => setWidth(region.clientWidth))
        observer.observe(region)

        return () => observer.disconnect()
    }, [region])

    useEffect(() => {
        if (!pdfDocument || !region) {
            return
        }

        let isCancelled = false
        let current: PdfRenderTask | undefined
        const previous = lastPaint.current

        async function paintPages(loaded: PdfDocument) {
            await previous

            for (let number = 1; number <= loaded.numPages; number += 1) {
                const canvas = canvases.current[number - 1]

                if (isCancelled || !canvas) {
                    return
                }

                const page = await loaded.getPage(number)

                if (isCancelled) {
                    return
                }

                const natural = page.getViewport({ scale: 1 })
                const cssWidth = renderWidth > 0 ? renderWidth : natural.width
                const outputScale = Math.min(window.devicePixelRatio || 1, MAX_OUTPUT_SCALE)
                const viewport = page.getViewport({
                    scale: (cssWidth / natural.width) * outputScale
                })

                canvas.width = Math.floor(viewport.width)
                canvas.height = Math.floor(viewport.height)
                current = page.render({ canvas, viewport })
                await current.promise

                if (number === 1 && !isCancelled) {
                    setHasPainted(true)
                }
            }
        }

        lastPaint.current = paintPages(pdfDocument).catch(() => {
            if (!isCancelled) {
                setHasFailed(true)
            }
        })

        return () => {
            isCancelled = true
            current?.cancel()
        }
    }, [pdfDocument, region, renderWidth])

    const attachRegion = useCallback((node: HTMLElement | null) => {
        setRegion(node)
        setWidth(node?.clientWidth ?? 0)
    }, [])

    const registerCanvas = useCallback(
        (index: number) => (node: HTMLCanvasElement | null) => {
            canvases.current[index] = node
        },
        []
    )

    const status = hasFailed ? "error" : hasPainted ? "ready" : "loading"

    return { status, pageCount: pdfDocument?.numPages ?? 0, attachRegion, registerCanvas }
}

export default usePdfPages
