import { describe, expect, it } from "vitest"
import validateLanguageParity from "@/services/content/validation/validateLanguageParity"
import buildContentSnapshot from "@/testUtils/buildContentSnapshot"
import profileOf from "@/testUtils/profileOf"
import projectsOf from "@/testUtils/projectsOf"
import timelineOf from "@/testUtils/timelineOf"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

function issuesAfter(mutate: (snapshot: ContentSnapshot) => void) {
    const snapshot = buildContentSnapshot()
    mutate(snapshot)
    return validateLanguageParity(snapshot)
}

describe("validateLanguageParity", () => {
    it("aceita o conteúdo igual nos três idiomas", () => {
        expect(issuesAfter(() => undefined)).toEqual([])
    })

    it("reprova campo neutro divergente", () => {
        const issues = issuesAfter((snapshot) => {
            projectsOf(snapshot, "en")[0].date = "2026-04"
        })

        expect(issues).toHaveLength(1)
        expect(issues[0].path).toBe("content/en/projects.json#items[0].date")
        expect(issues[0].message).toContain("Valor neutro diferente")
    })

    it("aceita campo por idioma com texto diferente", () => {
        expect(
            issuesAfter((snapshot) => {
                projectsOf(snapshot, "es")[0].title = "Mapas"
                profileOf(snapshot, "es").role = "Desarrollador"
                timelineOf(snapshot, "es")[0].title = "Desarrollador frontend"
            })
        ).toEqual([])
    })

    it("reprova lista com tamanho diferente", () => {
        const issues = issuesAfter((snapshot) => {
            profileOf(snapshot, "es").aboutParagraphs.push("Outro")
        })

        expect(issues[0].message).toContain("Lista com 2 itens")
    })

    it("reprova lista na ordem diferente", () => {
        const issues = issuesAfter((snapshot) => {
            projectsOf(snapshot, "en").reverse()
        })

        expect(issues.length).toBeGreaterThan(0)
    })

    it("reprova campo presente em um idioma só", () => {
        const issues = issuesAfter((snapshot) => {
            Reflect.deleteProperty(projectsOf(snapshot, "es")[0], "demoUrl")
        })

        expect(issues[0].path).toBe("content/es/projects.json#items[0].demoUrl")
    })

    it("reprova campo opcional traduzido ausente em um idioma", () => {
        const issues = issuesAfter((snapshot) => {
            Reflect.deleteProperty(profileOf(snapshot, "en").location, "detail")
        })

        expect(issues[0].path).toBe("content/en/profile.json#location.detail")
    })

    it("reprova mudança de tipo e id divergente", () => {
        const issues = issuesAfter((snapshot) => {
            Object.assign(profileOf(snapshot, "en").availability, { isAvailable: "sim" })
            timelineOf(snapshot, "en")[0].id = "0192f1b2-0000-7000-8000-0000000000ff"
        })

        expect(issues.map((issue) => issue.message).join(" ")).toContain("Tipo diferente")
        expect(issues.some((issue) => issue.path.endsWith("items[0].id"))).toBe(true)
    })

    it("ignora idioma sem arquivo (o retrato já registra o arquivo ausente)", () => {
        const issues = issuesAfter((snapshot) => {
            snapshot.languages.en.projects = undefined
            snapshot.languages.es.profile = undefined
            snapshot.languages.es.timeline = undefined
        })

        expect(issues).toEqual([])
    })
})
