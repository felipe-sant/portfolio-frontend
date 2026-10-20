import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
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
    it("copia o index.html para 404.html e cria o .nojekyll vazio", () => {
        const html = `<script src="${FATEC_BASE_PATH}assets/index.js"></script>`
        writeFileSync(join(directory, "index.html"), html)

        prepareFatecArtifact(directory)

        expect(readFileSync(join(directory, "404.html"), "utf-8")).toBe(html)
        expect(statSync(join(directory, ".nojekyll")).size).toBe(0)
    })

    it("falha em português quando o index.html não contém o base da Fatec", () => {
        writeFileSync(join(directory, "index.html"), '<script src="/assets/index.js"></script>')

        expect(() => prepareFatecArtifact(directory)).toThrow(/não contém o base/)
    })
})
