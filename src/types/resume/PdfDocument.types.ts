import type { PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf.mjs"

type PdfDocument = Pick<PDFDocumentProxy, "numPages" | "getPage">

export default PdfDocument
