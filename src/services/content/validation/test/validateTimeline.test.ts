import { describe, expect, it } from "vitest"
import validateTimeline from "@/services/content/validation/validateTimeline"
import buildContentSnapshot from "@/testUtils/buildContentSnapshot"
import timelineOf from "@/testUtils/timelineOf"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

function issuesAfter(mutate: (timeline: TimelineItemRecord[], snapshot: ContentSnapshot) => void) {
    const snapshot = buildContentSnapshot()
    mutate(timelineOf(snapshot, "pt-BR"), snapshot)
    return validateTimeline(snapshot).map((issue) => `${issue.path} ${issue.message}`)
}

describe("validateTimeline", () => {
    it("aceita itens válidos", () => {
        expect(issuesAfter(() => undefined)).toEqual([])
    })

    it("reprova organização ausente em experiência e formação, mas aceita em curso", () => {
        const issues = issuesAfter((timeline) => {
            Reflect.deleteProperty(timeline[0], "organization")
            Reflect.deleteProperty(timeline[1], "organization")
            Reflect.deleteProperty(timeline[2], "organization")
        })

        expect(issues).toHaveLength(2)
        expect(issues[0]).toContain("items[0].organization")
        expect(issues[1]).toContain("items[1].organization")
    })

    it("reprova summary vazio e título ausente", () => {
        const issues = issuesAfter((timeline) => {
            timeline[0].summary = ""
            Reflect.deleteProperty(timeline[1], "title")
        })

        expect(issues).toEqual([
            expect.stringContaining("items[0].summary"),
            expect.stringContaining("items[1].title Campo obrigatório ausente")
        ])
    })

    it("reprova stage em experiência", () => {
        const issues = issuesAfter((timeline) => {
            timeline[0].stage = "1º semestre"
        })

        expect(issues[0]).toContain("A etapa só vale em formação e curso")
    })

    it("reprova responsibilities fora de experiência e disciplines em experiência", () => {
        const issues = issuesAfter((timeline) => {
            timeline[1].responsibilities = ["Algo"]
            timeline[0].disciplines = ["Algo"]
        })

        expect(issues).toEqual([
            expect.stringContaining("items[0].disciplines"),
            expect.stringContaining("items[1].responsibilities")
        ])
    })

    it("reprova projects guardado no conteúdo e certificado sem nome", () => {
        const issues = issuesAfter((timeline) => {
            Object.assign(timeline[0], { projects: [] })
            timeline[1].certificates[0].name = ""
        })

        expect(issues).toEqual([
            expect.stringContaining("items[0].projects Campo desconhecido"),
            expect.stringContaining("items[1].certificates[0].name")
        ])
    })

    it("reprova lista que não é lista e item de lista vazio", () => {
        const issues = issuesAfter((timeline) => {
            Object.assign(timeline[0], { technologies: "React" })
            timeline[2].details = [""]
        })

        expect(issues).toEqual([
            expect.stringContaining("items[0].technologies Deve ser uma lista"),
            expect.stringContaining("items[2].details[0]")
        ])
    })
})
