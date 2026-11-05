import type PdfDocument from "@/types/resume/PdfDocument.types"

interface PdfLoadingTask {
    promise: Promise<PdfDocument>
    destroy(): Promise<void>
}

export default PdfLoadingTask
