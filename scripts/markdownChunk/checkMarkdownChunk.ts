import findEagerLeaks from "@scripts/markdownChunk/findEagerLeaks"
import findMarkdownChunks from "@scripts/markdownChunk/findMarkdownChunks"
import measureGzipSize from "@scripts/markdownChunk/measureGzipSize"

const GZIP_LIMIT = 102400

type CheckResult = { ok: boolean; messages: string[] }

async function checkMarkdownChunk(assetsDirectory: string): Promise<CheckResult> {
    const chunks = await findMarkdownChunks(assetsDirectory)

    if (chunks.length === 0) {
        return {
            ok: false,
            messages: [
                `O chunk do renderizador de markdown não foi encontrado em ${assetsDirectory}: o build não separou o renderizador.`
            ]
        }
    }

    const size = await measureGzipSize(chunks)
    const leaks = await findEagerLeaks(assetsDirectory)
    const messages = [`Chunk do markdown: ${size} bytes gzip (limite ${GZIP_LIMIT}).`]

    if (size > GZIP_LIMIT) {
        messages.push(
            `O chunk do markdown passou do limite: ${size} bytes gzip, limite ${GZIP_LIMIT}.`
        )
    }

    for (const name of leaks) {
        messages.push(
            `${name} carrega o react-markdown no caminho da entrada ou das páginas Início e Projetos.`
        )
    }

    return { ok: size <= GZIP_LIMIT && leaks.length === 0, messages }
}

export default checkMarkdownChunk
