import type PdfRenderTask from "@/types/resume/PdfRenderTask.types"
import type PdfViewport from "@/types/resume/PdfViewport.types"

interface PdfPage {
    getViewport(options: { scale: number }): PdfViewport
    render(options: { canvas: HTMLCanvasElement | null; viewport: PdfViewport }): PdfRenderTask
}

export default PdfPage
