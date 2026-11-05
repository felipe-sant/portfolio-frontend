import measureGzipSize from "@scripts/markdownChunk/measureGzipSize"
import findPdfChunks from "@scripts/pdfChunk/findPdfChunks"
import findPdfLeaks from "@scripts/pdfChunk/findPdfLeaks"

const MODULE_GZIP_LIMIT = 174080
const WORKER_GZIP_LIMIT = 430080

type CheckResult = { ok: boolean; messages: string[] }

async function checkPdfChunk(assetsDirectory: string): Promise<CheckResult> {
    const { modules, workers } = await findPdfChunks(assetsDirectory)

    if (modules.length === 0) {
        return {
            ok: false,
            messages: [
                `O chunk do pdfjs não foi encontrado em ${assetsDirectory}: o build não separou o renderizador de PDF.`
            ]
        }
    }

    if (workers.length === 0) {
        return {
            ok: false,
            messages: [
                `O worker do pdfjs não foi encontrado em ${assetsDirectory}: o build não emitiu o worker.`
            ]
        }
    }

    const moduleSize = await measureGzipSize(modules)
    const workerSize = await measureGzipSize(workers)
    const leaks = await findPdfLeaks(assetsDirectory)
    const messages = [
        `Chunk do pdfjs: ${moduleSize} bytes gzip (limite ${MODULE_GZIP_LIMIT}).`,
        `Worker do pdfjs: ${workerSize} bytes gzip (limite ${WORKER_GZIP_LIMIT}).`
    ]

    if (moduleSize > MODULE_GZIP_LIMIT) {
        messages.push(
            `O chunk do pdfjs passou do limite: ${moduleSize} bytes gzip, limite ${MODULE_GZIP_LIMIT}.`
        )
    }

    if (workerSize > WORKER_GZIP_LIMIT) {
        messages.push(
            `O worker do pdfjs passou do limite: ${workerSize} bytes gzip, limite ${WORKER_GZIP_LIMIT}.`
        )
    }

    for (const name of leaks) {
        messages.push(
            `${name} carrega o pdfjs no caminho da entrada ou das páginas Início e Projetos.`
        )
    }

    return {
        ok:
            moduleSize <= MODULE_GZIP_LIMIT &&
            workerSize <= WORKER_GZIP_LIMIT &&
            leaks.length === 0,
        messages
    }
}

export default checkPdfChunk
