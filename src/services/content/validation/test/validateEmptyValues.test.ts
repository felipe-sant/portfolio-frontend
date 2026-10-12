import { describe, expect, it } from "vitest"
import validateEmptyValues from "@/services/content/validation/validateEmptyValues"
import buildContentSnapshot from "@/testUtils/buildContentSnapshot"
import profileOf from "@/testUtils/profileOf"
import projectsOf from "@/testUtils/projectsOf"
import timelineOf from "@/testUtils/timelineOf"

describe("validateEmptyValues", () => {
    it("aceita conteúdo sem null nem texto vazio", () => {
        expect(validateEmptyValues(buildContentSnapshot())).toEqual([])
    })

    it("reprova string vazia em campo opcional e obrigatório", () => {
        const snapshot = buildContentSnapshot()
        projectsOf(snapshot, "pt-BR")[0].demoUrl = ""
        timelineOf(snapshot, "en")[0].summary = "   "

        const paths = validateEmptyValues(snapshot).map((issue) => issue.path)

        expect(paths).toEqual([
            "content/pt-BR/projects.json#items[0].demoUrl",
            "content/en/timeline.json#items[0].summary"
        ])
    })

    it("reprova null e item vazio de lista", () => {
        const snapshot = buildContentSnapshot()
        Object.assign(profileOf(snapshot, "es").location, { detail: null })
        profileOf(snapshot, "es").workPrinciples = [""]

        const messages = validateEmptyValues(snapshot).map((issue) => issue.message)

        expect(messages[0]).toContain("nunca null")
        expect(messages[1]).toContain("Texto vazio")
    })
})
