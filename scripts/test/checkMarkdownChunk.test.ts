import { createHash } from "node:crypto"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { gzipSync } from "node:zlib"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import checkMarkdownChunk from "@scripts/markdownChunk/checkMarkdownChunk"
import findMarkdownChunks from "@scripts/markdownChunk/findMarkdownChunks"
import measureGzipSize from "@scripts/markdownChunk/measureGzipSize"

const LIMIT = 102400

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
    directory = await mkdtemp(join(tmpdir(), "markdown-chunk-"))
    await writeAsset("index-abc.js", "console.log('entrada')")
    await writeAsset("Home.page-abc.js", "console.log('inicio')")
    await writeAsset("Projects.page-abc.js", "console.log('projetos')")
})

afterEach(async () => {
    await rm(directory, { recursive: true, force: true })
})

describe("findMarkdownChunks", () => {
    it("acha só os arquivos js do chunk do renderizador", async () => {
        await writeAsset("MarkdownDocument-xyz.js", "a")
        await writeAsset("MarkdownDocument-xyz.css", "a")
        await writeAsset("Project.page-xyz.js", "a")

        expect(await findMarkdownChunks(directory)).toEqual([
            join(directory, "MarkdownDocument-xyz.js")
        ])
    })

    it("devolve lista vazia quando não há chunk", async () => {
        expect(await findMarkdownChunks(directory)).toEqual([])
    })
})

describe("measureGzipSize", () => {
    it("mede o tamanho gzip do arquivo e soma vários arquivos", async () => {
        await writeAsset("MarkdownDocument-a.js", "a".repeat(5000))
        await writeAsset("MarkdownDocument-b.js", "b".repeat(7000))
        const files = [
            join(directory, "MarkdownDocument-a.js"),
            join(directory, "MarkdownDocument-b.js")
        ]

        const expected = gzipSync("a".repeat(5000)).length + gzipSync("b".repeat(7000)).length

        expect(await measureGzipSize(files)).toBe(expected)
    })
})

describe("checkMarkdownChunk", () => {
    it("falha dizendo que o chunk não foi encontrado quando o build não separou o renderizador", async () => {
        const result = await checkMarkdownChunk(directory)

        expect(result.ok).toBe(false)
        expect(result.messages.join("\n")).toMatch(/chunk.*não foi encontrado/i)
    })

    it("passa com 102400 bytes gzip e imprime o tamanho", async () => {
        await writeAsset("MarkdownDocument-xyz.js", bufferWithGzipSize(LIMIT))

        const result = await checkMarkdownChunk(directory)

        expect(result.ok).toBe(true)
        expect(result.messages.join("\n")).toContain("102400")
    })

    it("falha com 102401 bytes gzip, dizendo o tamanho e o limite", async () => {
        await writeAsset("MarkdownDocument-xyz.js", bufferWithGzipSize(LIMIT + 1))

        const result = await checkMarkdownChunk(directory)

        expect(result.ok).toBe(false)
        expect(result.messages.join("\n")).toContain("102401")
        expect(result.messages.join("\n")).toContain("102400")
    })

    it("mede a soma quando o renderizador está dividido em mais de um arquivo", async () => {
        await writeAsset("MarkdownDocument-a.js", bufferWithGzipSize(LIMIT / 2))
        await writeAsset("MarkdownDocument-b.js", bufferWithGzipSize(LIMIT / 2))

        const passing = await checkMarkdownChunk(directory)
        await writeAsset("MarkdownDocument-b.js", bufferWithGzipSize(LIMIT / 2 + 1))
        const failing = await checkMarkdownChunk(directory)

        expect(passing.ok).toBe(true)
        expect(failing.ok).toBe(false)
        expect(failing.messages.join("\n")).toContain("102401")
    })

    it.each(["index-abc.js", "Home.page-abc.js", "Projects.page-abc.js"])(
        "falha quando %s contém o react-markdown",
        async (name) => {
            await writeAsset("MarkdownDocument-xyz.js", "unwrapDisallowed")
            await writeAsset(name, "function a(){return unwrapDisallowed}")

            const result = await checkMarkdownChunk(directory)

            expect(result.ok).toBe(false)
            expect(result.messages.join("\n")).toContain(name)
        }
    )

    it("passa com entrada e páginas sem o react-markdown", async () => {
        await writeAsset("MarkdownDocument-xyz.js", "unwrapDisallowed")

        const result = await checkMarkdownChunk(directory)

        expect(result.ok).toBe(true)
    })
})
