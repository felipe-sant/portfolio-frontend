import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import readResumeMarkdown from "@scripts/cv/readResumeMarkdown"

describe("readResumeMarkdown", () => {
    let directory: string

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), "resume-md-"))
    })

    afterEach(() => {
        rmSync(directory, { recursive: true, force: true })
    })

    it("devolve o texto do Markdown do idioma", () => {
        writeFileSync(join(directory, "cv-en.md"), "# Name\n")

        expect(readResumeMarkdown("en", directory)).toBe("# Name\n")
    })

    it("falha em português com o idioma quando o arquivo falta", () => {
        expect(() => readResumeMarkdown("es", directory)).toThrow(
            "Markdown do currículo ausente para o idioma es"
        )
    })

    it("falha em português com o idioma quando o arquivo está vazio", () => {
        writeFileSync(join(directory, "cv-pt-BR.md"), "  \n")

        expect(() => readResumeMarkdown("pt-BR", directory)).toThrow(
            "Markdown do currículo vazio para o idioma pt-BR"
        )
    })
})
