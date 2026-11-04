import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    rmSync,
    writeFileSync
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import replaceFatecDocs from "@scripts/replaceFatecDocs"

let root = ""
let artifact = ""
let repository = ""

function write(path: string, content = "") {
    mkdirSync(join(path, ".."), { recursive: true })
    writeFileSync(path, content)
}

function writeValidArtifact() {
    write(join(artifact, "index.html"), "novo")
    write(join(artifact, "404.html"), "nao encontrada")
    write(join(artifact, ".nojekyll"))
}

function listFiles(directory: string, prefix = ""): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory()
            ? listFiles(join(directory, entry.name), `${prefix}${entry.name}/`)
            : [`${prefix}${entry.name}`]
    )
}

beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "fatec-docs-"))
    artifact = join(root, "artifact")
    repository = join(root, "repository")
    mkdirSync(artifact)
    mkdirSync(repository)
})

afterEach(() => {
    rmSync(root, { recursive: true, force: true })
})

describe("replaceFatecDocs", () => {
    it("deixa o docs/ só com o conteúdo do artefato", () => {
        writeValidArtifact()
        write(join(repository, "docs", "static", "old.js"), "antigo")
        write(join(repository, "docs", "manifest.json"), "antigo")

        replaceFatecDocs(artifact, repository)

        expect(listFiles(join(repository, "docs")).toSorted()).toEqual([
            ".nojekyll",
            "404.html",
            "index.html"
        ])
        expect(readFileSync(join(repository, "docs", "index.html"), "utf-8")).toBe("novo")
    })

    it("mantém o README.md da raiz e o que está fora do docs/", () => {
        writeValidArtifact()
        write(join(repository, "README.md"), "leia-me")
        write(join(repository, "extra", "dado.txt"), "dado")
        write(join(repository, "docs", "old.html"), "antigo")

        replaceFatecDocs(artifact, repository)

        expect(readFileSync(join(repository, "README.md"), "utf-8")).toBe("leia-me")
        expect(readFileSync(join(repository, "extra", "dado.txt"), "utf-8")).toBe("dado")
    })

    it("copia arquivos ocultos, 404.html e subpastas aninhadas", () => {
        writeValidArtifact()
        write(join(artifact, "pt-BR", "projects", "a.html"), "aninhado")

        replaceFatecDocs(artifact, repository)

        expect(existsSync(join(repository, "docs", ".nojekyll"))).toBe(true)
        expect(existsSync(join(repository, "docs", "404.html"))).toBe(true)
        expect(readFileSync(join(repository, "docs", "pt-BR", "projects", "a.html"), "utf-8")).toBe(
            "aninhado"
        )
    })

    it("cria o docs/ quando ele não existe no destino", () => {
        writeValidArtifact()

        replaceFatecDocs(artifact, repository)

        expect(existsSync(join(repository, "docs", "index.html"))).toBe(true)
    })

    it("falha em português sem index.html e não toca o destino", () => {
        write(join(artifact, "404.html"))
        write(join(artifact, ".nojekyll"))
        write(join(repository, "docs", "old.html"), "antigo")

        expect(() => replaceFatecDocs(artifact, repository)).toThrow(/index\.html/)
        expect(readFileSync(join(repository, "docs", "old.html"), "utf-8")).toBe("antigo")
    })

    it("falha em português sem .nojekyll e não toca o destino", () => {
        write(join(artifact, "index.html"))
        write(join(artifact, "404.html"))
        write(join(repository, "docs", "old.html"), "antigo")

        expect(() => replaceFatecDocs(artifact, repository)).toThrow(/\.nojekyll/)
        expect(existsSync(join(repository, "docs", "old.html"))).toBe(true)
    })

    it("falha em português sem 404.html e não toca o destino", () => {
        write(join(artifact, "index.html"))
        write(join(artifact, ".nojekyll"))
        write(join(repository, "docs", "old.html"), "antigo")

        expect(() => replaceFatecDocs(artifact, repository)).toThrow(/404\.html/)
        expect(existsSync(join(repository, "docs", "old.html"))).toBe(true)
    })

    it("falha em português quando o diretório do artefato não existe", () => {
        expect(() => replaceFatecDocs(join(root, "nada"), repository)).toThrow(
            /artefato .* não existe/
        )
    })
})
