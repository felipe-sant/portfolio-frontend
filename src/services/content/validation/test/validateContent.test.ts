import { describe, expect, it } from "vitest"
import validateContent from "@/services/content/validation/validateContent"
import buildContentSnapshot from "@/testUtils/buildContentSnapshot"
import projectsOf from "@/testUtils/projectsOf"

describe("validateContent", () => {
    it("aceita o conteúdo válido em memória", () => {
        expect(validateContent(buildContentSnapshot())).toEqual([])
    })

    it("inclui os problemas de leitura do retrato", () => {
        const snapshot = buildContentSnapshot()
        snapshot.issues.push({ path: "content/en/profile.json", message: "Arquivo ausente" })

        expect(validateContent(snapshot)).toEqual([
            { path: "content/en/profile.json", message: "Arquivo ausente" }
        ])
    })

    it("reúne os problemas de grupos diferentes", () => {
        const snapshot = buildContentSnapshot()
        const [project] = projectsOf(snapshot, "pt-BR")
        project.date = "2026-13"
        project.id = "abc"

        const paths = validateContent(snapshot).map((issue) => issue.path)

        expect(paths).toContain("content/pt-BR/projects.json#items[0].date")
        expect(paths).toContain("content/pt-BR/projects.json#items[0].id")
    })
})
