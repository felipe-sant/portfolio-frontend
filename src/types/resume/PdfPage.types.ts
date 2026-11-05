import type { PDFPageProxy } from "pdfjs-dist/legacy/build/pdf.mjs"

type PdfPage = Pick<PDFPageProxy, "getViewport" | "render" | "cleanup">

export default PdfPage
