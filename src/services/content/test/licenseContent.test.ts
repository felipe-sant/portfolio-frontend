import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import validateContent from "@/services/content/validation/validateContent"
import readContentSnapshot from "@/testUtils/readContentSnapshot"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

function root(...parts: string[]) {
    return join(process.cwd(), "public", "content", ...parts)
}

async function readProjects(language: string): Promise<ProjectRecord[]> {
    const parsed: { items: ProjectRecord[] } = JSON.parse(
        await readFile(root(language, "projects.json"), "utf-8")
    )

    return parsed.items
}

async function listProjectsWithLicense(): Promise<string[]> {
    const projects = await readdir(root("shared", "projects"))
    const withLicense: string[] = []

    for (const project of projects) {
        const files: string[] = await readdir(root("shared", "projects", project, "docs")).catch(
            () => []
        )
        if (files.includes("LICENSE")) {
            withLicense.push(project)
        }
    }

    return withLicense
}

describe.each(SUPPORTED_LANGUAGES)("LICENSE dos projetos em %s", (language) => {
    it("declara o LICENSE de todo projeto que tem o arquivo, como texto neutro em inglês, depois dos outros documentos", async () => {
        const projects = await readProjects(language)
        const withLicense = await listProjectsWithLicense()

        expect(withLicense.length).toBeGreaterThan(0)
        for (const project of withLicense) {
            const record = projects.find((item) => item.id === project)

            expect(record?.documents[0]?.name, project).toBe("README.md")
            expect(record?.documents.at(-1), project).toMatchObject({
                name: "LICENSE",
                format: "text",
                translated: false,
                contentLanguage: "en"
            })
        }
    })
})

describe("LICENSE dos projetos", () => {
    it("todo LICENSE declarado em um projeto tem arquivo não vazio em shared", async () => {
        const projects = await readProjects("pt-BR")

        expect(
            projects.filter((record) =>
                record.documents.some((document) => document.name === "LICENSE")
            ).length
        ).toBeGreaterThan(0)
        for (const record of projects) {
            if (record.documents.some((document) => document.name === "LICENSE")) {
                const content = await readFile(
                    root("shared", "projects", record.id, "docs", "LICENSE")
                )

                expect(content.length, record.id).toBeGreaterThan(0)
            }
        }
    })

    it("não exige LICENSE: o conteúdo continua válido sem o documento e sem o arquivo", async () => {
        const snapshot = await readContentSnapshot()

        for (const language of SUPPORTED_LANGUAGES) {
            for (const project of snapshot.languages[language].projects ?? []) {
                project.documents = project.documents.filter(
                    (document) => document.name !== "LICENSE"
                )
            }
        }
        for (const file of Object.keys(snapshot.files)) {
            if (file.endsWith("/docs/LICENSE")) {
                delete snapshot.files[file]
            }
        }

        expect(validateContent(snapshot)).toEqual([])
    })
})
