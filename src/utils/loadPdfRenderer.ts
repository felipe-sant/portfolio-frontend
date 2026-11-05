import type PdfOpener from "@/types/resume/PdfOpener.types"

let openerPromise: Promise<PdfOpener> | undefined

async function importPdfRenderer(): Promise<PdfOpener> {
    const [pdfjs, worker] = await Promise.all([
        import("pdfjs-dist/legacy/build/pdf.mjs"),
        import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")
    ])

    pdfjs.GlobalWorkerOptions.workerSrc = worker.default

    return (url) => pdfjs.getDocument({ url })
}

function loadPdfRenderer() {
    openerPromise ??= importPdfRenderer().catch((error: unknown) => {
        openerPromise = undefined
        throw error
    })

    return openerPromise
}

export default loadPdfRenderer
