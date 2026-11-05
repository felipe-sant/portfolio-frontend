import { createHash } from "node:crypto"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import checkPdfChunk from "@scripts/pdfChunk/checkPdfChunk"

const MODULE_LIMIT = 174080
const WORKER_LIMIT = 430080
const MARKER = "Setting up fake worker failed"

let directory = ""

function noise(length: number): Buffer {
    const blocks: Buffer[] = []
    let seed = "chunk"

    while (blocks.length * 32 < length) {
        const block = createHash("sha256").update(seed).digest()
        blocks.push(block)
        seed = block.toString("hex")
    }

    return Buffer.concat(blocks).subarray(0, length)
}

function bufferWithGzipSize(target: number): Buffer {
    let length = target
    let buffer = noise(length)

    while (gzipSync(buffer).length !== target) {
        length += target - gzipSync(buffer).length
        buffer = noise(length)
    }

    return buffer
}

async function writeAsset(name: string, content: Buffer | string) {
    await writeFile(join(directory, name), content)
}

beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "pdf-chunk-"))
    await writeAsset("index-abc.js", "console.log('entrada')")
    await writeAsset("Home.page-abc.js", "console.log('inicio')")
    await writeAsset("Projects.page-abc.js", "console.log('projetos')")
})

afterEach(async () => {
    await rm(directory, { recursive: true, force: true })
})

describe("checkPdfChunk", () => {
    it("falha dizendo que o chunk do pdfjs não foi encontrado", async () => {
        await writeAsset("pdf.worker.min-xyz.mjs", "w")

        const result = await checkPdfChunk(directory)

        expect(result.ok).toBe(false)
        expect(result.messages.join("\n")).toMatch(/chunk do pdfjs não foi encontrado/i)
    })

    it("falha dizendo que o worker não foi encontrado", async () => {
        await writeAsset("pdf-xyz.js", MARKER)

        const result = await checkPdfChunk(directory)

        expect(result.ok).toBe(false)
        expect(result.messages.join("\n")).toMatch(/worker do pdfjs não foi encontrado/i)
    })

    it("passa dentro do orçamento e imprime os dois tamanhos", async () => {
        await writeAsset("pdf-xyz.js", bufferWithGzipSize(MODULE_LIMIT))
        await writeAsset("pdf.worker.min-xyz.mjs", bufferWithGzipSize(WORKER_LIMIT))

        const result = await checkPdfChunk(directory)

        expect(result.ok).toBe(true)
        expect(result.messages.join("\n")).toContain(String(MODULE_LIMIT))
        expect(result.messages.join("\n")).toContain(String(WORKER_LIMIT))
    })

    it("falha quando o chunk do pdfjs passa do limite, dizendo tamanho e limite", async () => {
        await writeAsset("pdf-xyz.js", bufferWithGzipSize(MODULE_LIMIT + 1))
        await writeAsset("pdf.worker.min-xyz.mjs", "w")

        const result = await checkPdfChunk(directory)

        expect(result.ok).toBe(false)
        expect(result.messages.join("\n")).toContain(String(MODULE_LIMIT + 1))
        expect(result.messages.join("\n")).toContain(String(MODULE_LIMIT))
    })

    it("falha quando o worker passa do limite, dizendo tamanho e limite", async () => {
        await writeAsset("pdf-xyz.js", MARKER)
        await writeAsset("pdf.worker.min-xyz.mjs", bufferWithGzipSize(WORKER_LIMIT + 1))

        const result = await checkPdfChunk(directory)

        expect(result.ok).toBe(false)
        expect(result.messages.join("\n")).toContain(String(WORKER_LIMIT + 1))
        expect(result.messages.join("\n")).toContain(String(WORKER_LIMIT))
    })

    it.each(["index-abc.js", "Home.page-abc.js", "Projects.page-abc.js"])(
        "falha quando %s contém o pdfjs",
        async (name) => {
            await writeAsset("pdf-xyz.js", MARKER)
            await writeAsset("pdf.worker.min-xyz.mjs", "w")
            await writeAsset(name, `function a(){return "${MARKER}"}`)

            const result = await checkPdfChunk(directory)

            expect(result.ok).toBe(false)
            expect(result.messages.join("\n")).toContain(name)
        }
    )

    it("passa com entrada e páginas sem o pdfjs", async () => {
        await writeAsset("pdf-xyz.js", MARKER)
        await writeAsset("pdf.worker.min-xyz.mjs", "w")

        const result = await checkPdfChunk(directory)

        expect(result.ok).toBe(true)
    })
})
