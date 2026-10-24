import { mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import prepareFatecArtifact from "@scripts/prepareFatecArtifact"

let directory = ""

beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "fatec-artifact-"))
})

afterEach(() => {
    rmSync(directory, { recursive: true, force: true })
})

describe("prepareFatecArtifact", () => {
    it("cria o .nojekyll vazio quando o 404.html tem o base da Fatec", () => {
        writeFileSync(
            join(directory, "404.html"),
            `<script src="${FATEC_BASE_PATH}assets/index.js"></script>`
        )

        prepareFatecArtifact(directory)

        expect(statSync(join(directory, ".nojekyll")).size).toBe(0)
    })

    it("não sobrescreve o 404.html pré-renderizado", () => {
        const html = `<h1>Page not found</h1><script src="${FATEC_BASE_PATH}assets/index.js"></script>`
        writeFileSync(join(directory, "404.html"), html)
        writeFileSync(join(directory, "index.html"), "outro")

        prepareFatecArtifact(directory)

        expect(statSync(join(directory, "404.html")).size).toBe(Buffer.byteLength(html))
    })

    it("falha em português quando o 404.html não existe", () => {
        writeFileSync(
            join(directory, "index.html"),
            `<script src="${FATEC_BASE_PATH}a.js"></script>`
        )

        expect(() => prepareFatecArtifact(directory)).toThrow(/404.html não existe/)
    })

    it("falha em português quando o 404.html não contém o base da Fatec", () => {
        writeFileSync(join(directory, "404.html"), '<script src="/assets/index.js"></script>')

        expect(() => prepareFatecArtifact(directory)).toThrow(/não contém o base/)
    })
})
