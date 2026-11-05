// @vitest-environment node
import { readFileSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"

const REAL_WORKER = pathToFileURL(
    join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.min.mjs")
).href
const PDF_URL = pathToFileURL(join(process.cwd(), "public", "cv", "cv-pt-BR.pdf")).href

afterEach(() => {
    vi.resetModules()
    vi.doUnmock("pdfjs-dist/legacy/build/pdf.mjs")
    vi.doUnmock("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")
})

describe("loadPdfRenderer", () => {
    it("abre o PDF do currículo e devolve o número de páginas", async () => {
        vi.doMock("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url", () => ({
            default: REAL_WORKER
        }))
        const { default: loadPdfRenderer } = await import("@/utils/loadPdfRenderer")

        const openDocument = await loadPdfRenderer()
        const task = openDocument(PDF_URL)
        const document = await task.promise

        expect(document.numPages).toBeGreaterThan(0)
        await task.destroy()
    })

    it("abre só o endereço do PDF, sem scripts nem avaliação dinâmica", async () => {
        const getDocument = vi.fn(() => ({ promise: Promise.resolve(), destroy: vi.fn() }))
        const GlobalWorkerOptions = { workerSrc: "" }
        vi.doMock("pdfjs-dist/legacy/build/pdf.mjs", () => ({ getDocument, GlobalWorkerOptions }))
        vi.doMock("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url", () => ({
            default: "/assets/pdf.worker.min-abc.mjs"
        }))
        const { default: loadPdfRenderer } = await import("@/utils/loadPdfRenderer")

        const openDocument = await loadPdfRenderer()
        openDocument("/cv/cv-pt-BR.pdf")

        expect(GlobalWorkerOptions.workerSrc).toBe("/assets/pdf.worker.min-abc.mjs")
        expect(getDocument).toHaveBeenCalledTimes(1)
        expect(getDocument).toHaveBeenCalledWith({ url: "/cv/cv-pt-BR.pdf" })
    })

    it("não avalia o pdfjs ao importar o módulo, só ao carregar", async () => {
        const evaluated = vi.fn()
        vi.doMock("pdfjs-dist/legacy/build/pdf.mjs", () => {
            evaluated()
            return { getDocument: vi.fn(), GlobalWorkerOptions: { workerSrc: "" } }
        })
        vi.doMock("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url", () => ({ default: "/w.mjs" }))

        const { default: loadPdfRenderer } = await import("@/utils/loadPdfRenderer")
        expect(evaluated).not.toHaveBeenCalled()

        await loadPdfRenderer()
        expect(evaluated).toHaveBeenCalledTimes(1)
    })
})

describe("build legacy do pdfjs-dist", () => {
    it.each(["pdf.mjs", "pdf.worker.mjs"])(
        "%s não usa eval nem new Function, então não há avaliação dinâmica a desligar",
        (file) => {
            const source = readFileSync(
                join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", file),
                "utf-8"
            )

            expect(source).not.toMatch(/\beval\s*\(/)
            expect(source).not.toMatch(/new\s+Function\s*\(/)
        }
    )
})
