import type { PDFDocumentLoadingTask } from "pdfjs-dist/legacy/build/pdf.mjs"

type PdfOpener = (url: string) => Pick<PDFDocumentLoadingTask, "promise" | "destroy">

export default PdfOpener
