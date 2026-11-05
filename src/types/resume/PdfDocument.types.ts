import type PdfPage from "@/types/resume/PdfPage.types"

interface PdfDocument {
    numPages: number
    getPage(pageNumber: number): Promise<PdfPage>
}

export default PdfDocument
