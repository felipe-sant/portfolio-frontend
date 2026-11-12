// @vitest-environment node
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import readSeoContent from "@scripts/seo/readSeoContent"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"

const PAGES = ["home", "projects", "about", "contact"] as const

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

    it.each(["", "   "])(
        "falha em português citando o arquivo quando meta.description de contact.json vem vazia (%j)",
        (description) => {
            const locales = join(directory, "locales")
            cpSync("src/locales", locales, { recursive: true })
            const file = join(locales, "es", "contact.json")
            const json = JSON.parse(readFileSync(file, "utf-8"))
            json.meta.description = description
            writeFileSync(file, JSON.stringify(json))

            expect(() => readSeoContent("public", locales)).toThrow(
                `meta.description ausente em ${file}`
            )
        }
    )

    it("falha em português citando o arquivo quando meta.description falta em home.json", () => {
        const locales = join(directory, "locales")
        cpSync("src/locales", locales, { recursive: true })
        const file = join(locales, "en", "home.json")
        const json = JSON.parse(readFileSync(file, "utf-8"))
        delete json.meta.description
        writeFileSync(file, JSON.stringify(json))

        expect(() => readSeoContent("public", locales)).toThrow(
            `meta.description ausente em ${file}`
        )
    })

    it("traz a meta.description das quatro páginas nos três idiomas", () => {
        const content = readSeoContent("public")

        SUPPORTED_LANGUAGES.forEach((language) => {
            PAGES.forEach((page) => {
                const json = JSON.parse(
                    readFileSync(join("src", "locales", language, `${page}.json`), "utf-8")
                )

                expect(content[language].labels.pageDescriptions[page]).toBe(json.meta.description)
            })
        })
    })

    it("lê os três idiomas de public/ com perfil, projetos, documentos, trajetória e currículo", () => {
        const content = readSeoContent("public")

        SUPPORTED_LANGUAGES.forEach((language) => {
            const languageContent = content[language]
            const markdown = languageContent.projects.flatMap((project) =>
                project.documents.filter((document) => document.format === "markdown")
            )

            expect(languageContent.labels.authorName).not.toBe("")
            expect(languageContent.labels.navigation.projects).not.toBe("")
            expect(languageContent.labels.projectStatus.inDevelopment).not.toBe("")
            expect(languageContent.labels.stackCategory.tooling).not.toBe("")
            expect(languageContent.profile.summary).not.toBe("")
            expect(languageContent.projects.length).toBeGreaterThan(0)
            expect(languageContent.timeline.length).toBeGreaterThan(0)
            expect(languageContent.resume.trim()).not.toBe("")
            expect(markdown.length).toBeGreaterThan(0)
            expect(markdown.every((document) => document.text.trim() !== "")).toBe(true)
        })
    })
})
