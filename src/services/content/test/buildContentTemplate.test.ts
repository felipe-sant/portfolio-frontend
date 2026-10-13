import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import buildContentTemplate from "@/services/content/buildContentTemplate"
import createBlankProfile from "@/services/content/template/createBlankProfile"
import createBlankProject from "@/services/content/template/createBlankProject"
import createBlankTimelineItem from "@/services/content/template/createBlankTimelineItem"
import validateContent from "@/services/content/validation/validateContent"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type LanguageContent from "@/types/content/LanguageContent.types"

const TEMPLATE_FOLDER = join(process.cwd(), "content", "template", "pt-BR")

function blankLanguage(): LanguageContent {
    return {
        profile: createBlankProfile(),
        timeline: [createBlankTimelineItem()],
        projects: [createBlankProject()]
    }
}

describe("buildContentTemplate", () => {
    it("gera os três arquivos do modelo", () => {
        expect(Object.keys(buildContentTemplate())).toEqual([
            "profile.json",
            "timeline.json",
            "projects.json"
        ])
    })

    it.each(["profile.json", "timeline.json", "projects.json"] as const)(
        "mantém %s em sincronia com os arquivos de content/template/pt-BR (rode npm run content:template)",
        async (name) => {
            const generated = buildContentTemplate()[name]
            const saved = await readFile(join(TEMPLATE_FOLDER, name), "utf-8")

            expect(JSON.parse(saved)).toEqual(JSON.parse(generated))
        }
    )

    it("traz todos os campos do contrato, inclusive os opcionais, vazios", () => {
        const project = createBlankProject()
        const item = createBlankTimelineItem()
        const profile = createBlankProfile()

        expect(Object.keys(project)).toEqual(
            expect.arrayContaining(["demoUrl", "repositoryUrl", "updatedAt", "images", "documents"])
        )
        expect(Object.keys(item)).toEqual(
            expect.arrayContaining(["organization", "stage", "end", "projectIds"])
        )
        expect(Object.keys(profile)).toEqual(expect.arrayContaining(["photo", "links", "contact"]))
        expect(project.title).toBe("")
        expect(item.title).toBe("")
        expect(profile.role).toBe("")
    })

    it("é reprovado pelo validador enquanto não for preenchido, sem lançar exceção", () => {
        const snapshot: ContentSnapshot = {
            languages: { "pt-BR": blankLanguage(), en: blankLanguage(), es: blankLanguage() },
            files: {},
            issues: []
        }

        const issues = validateContent(snapshot)

        expect(issues.length).toBeGreaterThan(10)
        expect(issues.map((issue) => issue.path)).toEqual(
            expect.arrayContaining([
                "content/pt-BR/projects.json#items[0].id",
                "content/pt-BR/projects.json#items[0].title",
                "content/pt-BR/timeline.json#items[0].start",
                "content/pt-BR/profile.json#role"
            ])
        )
    })
})
