import { describe, expect, it } from "vitest"
import buildProjectDetailFixture from "@/testUtils/buildProjectDetailFixture"
import projectsOf from "@/testUtils/projectsOf"
import readContentSnapshot from "@/testUtils/readContentSnapshot"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import buildPersonId from "@/utils/buildPersonId"
import buildProjectJsonLd from "@/utils/buildProjectJsonLd"

const LANGUAGES: SupportedLanguage[] = ["pt-BR", "en", "es"]
const PROJECTS_PER_LANGUAGE = 6

describe("buildProjectJsonLd sobre os dados reais", () => {
    describe.each(LANGUAGES)("em %s", (language) => {
        it("são seis projetos", async () => {
            const snapshot = await readContentSnapshot()

            expect(projectsOf(snapshot, language)).toHaveLength(PROJECTS_PER_LANGUAGE)
        })

        it("todo projeto vira SoftwareSourceCode com name, description, url absoluta, author, codeRepository e ao menos uma programmingLanguage", async () => {
            const snapshot = await readContentSnapshot()

            for (const project of projectsOf(snapshot, language)) {
                const node = buildProjectJsonLd(
                    language,
                    buildProjectDetailFixture({
                        id: project.id,
                        title: project.title,
                        summary: project.summary,
                        stack: project.stack,
                        repositoryUrl: project.repositoryUrl
                    }),
                    []
                )

                expect(node["@type"]).toBe("SoftwareSourceCode")
                expect(node.name).toBe(project.title)
                expect(node.description).toBe(project.summary)
                expect(node.url).toMatch(
                    new RegExp(`^https?://[^/]+(/[^/]+)*/${language}/projects/${project.id}$`)
                )
                expect(node.author).toEqual({ "@id": buildPersonId() })
                expect(node.codeRepository).toBe(project.repositoryUrl)
                expect(node.codeRepository).toBeTruthy()
                expect(node.programmingLanguage).toEqual(
                    expect.arrayContaining([expect.any(String)])
                )
            }
        })
    })
})
