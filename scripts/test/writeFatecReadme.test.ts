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
import writeFatecReadme from "@scripts/writeFatecReadme"

const TEMPLATE = "versão {{TAG}} commit {{SHA}}"
const ORIGIN = { tag: "v1.3.0", sha: "a1b2c3d" }

let root = ""
let source = ""
let repository = ""

function write(path: string, content: string | Buffer = "") {
    mkdirSync(join(path, ".."), { recursive: true })
    writeFileSync(path, content)
}

function writeValidSource() {
    write(join(source, "scripts/fatecReadme.template.md"), TEMPLATE)
    write(join(source, "docs/design/assets/readme/home-light.png"), "claro")
    write(join(source, "docs/design/assets/readme/home-dark.png"), "escuro")
}

function listFiles(directory: string, prefix = ""): string[] {
    return readdirSync(directory, { withFileTypes: true })
        .flatMap((entry) =>
            entry.isDirectory()
                ? listFiles(join(directory, entry.name), `${prefix}${entry.name}/`)
                : [`${prefix}${entry.name}`]
        )
        .toSorted()
}

beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "write-fatec-readme-"))
    source = join(root, "source")
    repository = join(root, "repository")
    mkdirSync(source)
    mkdirSync(join(repository, "docs"), { recursive: true })
    write(join(repository, "docs/index.html"), "site")
    write(join(repository, "README.md"), "antigo")
})

afterEach(() => {
    rmSync(root, { recursive: true, force: true })
})

describe("writeFatecReadme", () => {
    it("falha em português sem criar nada se o clone não existe", () => {
        writeValidSource()
        const missing = join(root, "ausente")

        expect(() => writeFatecReadme(missing, ORIGIN, source)).toThrow(/não existe/)
        expect(existsSync(missing)).toBe(false)
    })

    it("falha em português sem tocar o destino se o modelo não existe", () => {
        write(join(source, "docs/design/assets/readme/home-light.png"), "claro")
        write(join(source, "docs/design/assets/readme/home-dark.png"), "escuro")

        expect(() => writeFatecReadme(repository, ORIGIN, source)).toThrow(/modelo/)
        expect(readFileSync(join(repository, "README.md"), "utf-8")).toBe("antigo")
    })

    it("falha em português sem tocar o destino se uma captura de origem falta", () => {
        writeValidSource()
        rmSync(join(source, "docs/design/assets/readme/home-dark.png"))

        expect(() => writeFatecReadme(repository, ORIGIN, source)).toThrow(/home-dark\.png/)
        expect(readFileSync(join(repository, "README.md"), "utf-8")).toBe("antigo")
        expect(existsSync(join(repository, "docs/readme"))).toBe(false)
    })

    it("falha se uma captura pesa mais de 300 KB", () => {
        writeValidSource()
        write(
            join(source, "docs/design/assets/readme/home-light.png"),
            Buffer.alloc(300 * 1024 + 1)
        )

        expect(() => writeFatecReadme(repository, ORIGIN, source)).toThrow(/300 KB/)
        expect(readFileSync(join(repository, "README.md"), "utf-8")).toBe("antigo")
    })

    it("não toca o destino se a tag é inválida", () => {
        writeValidSource()

        expect(() =>
            writeFatecReadme(repository, { tag: "v2.0.0", sha: "a1b2c3d" }, source)
        ).toThrow(/tag/i)
        expect(readFileSync(join(repository, "README.md"), "utf-8")).toBe("antigo")
    })

    it("grava o README renderizado na raiz do destino", () => {
        writeValidSource()

        writeFatecReadme(repository, ORIGIN, source)

        expect(readFileSync(join(repository, "README.md"), "utf-8")).toBe(
            "versão v1.3.0 commit a1b2c3d"
        )
    })

    it("copia as duas capturas para docs/readme depois da troca do docs", () => {
        writeValidSource()

        writeFatecReadme(repository, ORIGIN, source)

        expect(readFileSync(join(repository, "docs/readme/home-light.png"), "utf-8")).toBe("claro")
        expect(readFileSync(join(repository, "docs/readme/home-dark.png"), "utf-8")).toBe("escuro")
        expect(readFileSync(join(repository, "docs/index.html"), "utf-8")).toBe("site")
    })

    it("só escreve README.md na raiz e docs/readme", () => {
        writeValidSource()
        write(join(repository, "LICENSE"), "intocado")

        writeFatecReadme(repository, ORIGIN, source)

        expect(readdirSync(repository).toSorted()).toEqual(["LICENSE", "README.md", "docs"])
        expect(readFileSync(join(repository, "LICENSE"), "utf-8")).toBe("intocado")
    })

    it("produz o mesmo resultado ao rodar duas vezes", () => {
        writeValidSource()

        writeFatecReadme(repository, ORIGIN, source)
        const first = listFiles(repository).map((file) =>
            readFileSync(join(repository, file), "utf-8")
        )
        writeFatecReadme(repository, ORIGIN, source)
        const second = listFiles(repository).map((file) =>
            readFileSync(join(repository, file), "utf-8")
        )

        expect(second).toEqual(first)
    })
})
