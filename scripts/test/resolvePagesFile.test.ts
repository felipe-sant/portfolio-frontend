import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import resolvePagesFile from "@scripts/resolvePagesFile"

let directory = ""

function write(path: string) {
    const file = join(directory, path)
    mkdirSync(join(file, ".."), { recursive: true })
    writeFileSync(file, path)
}

beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "pages-"))
    write("index.html")
    write("404.html")
    write("en.html")
    write("en/projects.html")
    write("en/projects/abc/docs/SETUP.md.html")
    write("assets/app.js")
    write("docs/guide/index.html")
    write("docs/my guide/index.html")
    write("docs/café/index.html")
})

afterEach(() => {
    rmSync(directory, { recursive: true, force: true })
})

describe("resolvePagesFile", () => {
    it("serve a raiz pelo index.html", () => {
        expect(resolvePagesFile(directory, "")).toEqual({
            status: 200,
            file: join(directory, "index.html")
        })
    })

    it("prefere o arquivo exato", () => {
        expect(resolvePagesFile(directory, "assets/app.js")).toEqual({
            status: 200,
            file: join(directory, "assets/app.js")
        })
    })

    it("serve <caminho>.html quando não há arquivo exato", () => {
        expect(resolvePagesFile(directory, "en")).toEqual({
            status: 200,
            file: join(directory, "en.html")
        })
    })

    it("serve o <caminho>.html mesmo com uma pasta de mesmo nome ao lado", () => {
        expect(resolvePagesFile(directory, "en/projects")).toEqual({
            status: 200,
            file: join(directory, "en/projects.html")
        })
        expect(resolvePagesFile(directory, "en").file).toBe(join(directory, "en.html"))
    })

    it("serve o documento com extensão por <nome>.md.html", () => {
        expect(resolvePagesFile(directory, "en/projects/abc/docs/SETUP.md")).toEqual({
            status: 200,
            file: join(directory, "en/projects/abc/docs/SETUP.md.html")
        })
    })

    it("responde 301 para a pasta com index.html sem a barra final", () => {
        expect(resolvePagesFile(directory, "docs/guide")).toEqual({
            status: 301,
            location: "docs/guide/"
        })
    })

    it("serve o index.html da pasta com a barra final", () => {
        expect(resolvePagesFile(directory, "docs/guide/")).toEqual({
            status: 200,
            file: join(directory, "docs/guide/index.html")
        })
    })

    it("responde 404 em /en/ porque a pasta en não tem index.html", () => {
        expect(resolvePagesFile(directory, "en/")).toEqual({
            status: 404,
            file: join(directory, "404.html")
        })
    })

    it("responde 404 com o 404.html para um caminho desconhecido", () => {
        expect(resolvePagesFile(directory, "xyz")).toEqual({
            status: 404,
            file: join(directory, "404.html")
        })
    })

    it("não trata uma pasta sem index.html como arquivo exato", () => {
        expect(resolvePagesFile(directory, "assets").status).toBe(404)
    })

    it("mantém o caminho original codificado no Location do 301", () => {
        expect(resolvePagesFile(directory, "docs/my%20guide").location).toBe("docs/my%20guide/")
        expect(resolvePagesFile(directory, "docs/caf%C3%A9").location).toBe("docs/caf%C3%A9/")
    })

    it.each([
        ["..%5c"],
        ["%2e%2e%2f"],
        ["%2e%2e/%2e%2e/etc"],
        ["//etc/passwd"],
        ["pt-BR%00"],
        ["docs%0a"]
    ])("responde 404 para o caminho suspeito %s", (path) => {
        expect(resolvePagesFile(directory, path).status).toBe(404)
    })

    it("responde 404 para escape de URL inválido", () => {
        expect(resolvePagesFile(directory, "%E0%A4%A").status).toBe(404)
    })

    it("responde 404 para caminho que sobe de pasta", () => {
        expect(resolvePagesFile(directory, "../secret").status).toBe(404)
        expect(resolvePagesFile(directory, "%2e%2e/secret").status).toBe(404)
    })
})
