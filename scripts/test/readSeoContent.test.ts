// @vitest-environment node
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import readSeoContent from "@scripts/seo/readSeoContent"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"

describe("readSeoContent", () => {
    let directory: string

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), "seo-content-"))
        cpSync("public/content", join(directory, "content"), { recursive: true })
        cpSync("public/cv", join(directory, "cv"), { recursive: true })
    })

    afterEach(() => {
        rmSync(directory, { recursive: true, force: true })
    })

    it("falha em português citando o arquivo quando projects.json não é JSON válido", () => {
        const file = join(directory, "content", "en", "projects.json")
        writeFileSync(file, "{ quebrado")

        expect(() => readSeoContent(directory)).toThrow(`JSON inválido em ${file}`)
    })

    it.each(["profile.json", "timeline.json"])(
        "falha em português citando %s quando não é JSON válido",
        (name) => {
            const file = join(directory, "content", "es", name)
            writeFileSync(file, "][")

            expect(() => readSeoContent(directory)).toThrow(`JSON inválido em ${file}`)
        }
    )

    it("falha citando o caminho quando um documento listado não existe no disco", () => {
        const file = join(directory, "content", "pt-BR", "projects.json")
        const projects = JSON.parse(readFileSync(file, "utf-8"))
        const [project] = projects.items
        const readme = project.documents.find(
            (document: { name: string }) => document.name === "README.md"
        )
        const missing = join(
            directory,
            "content",
            "pt-BR",
            "projects",
            project.id,
            "docs",
            readme.name
        )
        rmSync(missing)

        expect(() => readSeoContent(directory)).toThrow(`Documento ausente: ${missing}`)
    })

    it.each(["md", "pdf"])("falha citando o caminho quando cv-en.%s falta", (format) => {
        const file = join(directory, "cv", `cv-en.${format}`)
        rmSync(file)

        expect(() => readSeoContent(directory)).toThrow(file)
    })

    it("lê os três idiomas de public/ com perfil, projetos, documentos, trajetória e currículo", () => {
        const content = readSeoContent("public")

        SUPPORTED_LANGUAGES.forEach((language) => {
            const languageContent = content[language]
            const markdown = languageContent.projects.flatMap((project) =>
                project.documents.filter((document) => document.format === "markdown")
            )

            expect(languageContent.authorName).not.toBe("")
            expect(languageContent.profile.summary).not.toBe("")
            expect(languageContent.projects.length).toBeGreaterThan(0)
            expect(languageContent.timeline.length).toBeGreaterThan(0)
            expect(languageContent.resume.trim()).not.toBe("")
            expect(markdown.length).toBeGreaterThan(0)
            expect(markdown.every((document) => document.text.trim() !== "")).toBe(true)
        })
    })
})
