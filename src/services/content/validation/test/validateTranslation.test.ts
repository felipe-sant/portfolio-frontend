import { describe, expect, it } from "vitest"
import validateTranslation from "@/services/content/validation/validateTranslation"
import buildContentSnapshot from "@/testUtils/buildContentSnapshot"
import profileOf from "@/testUtils/profileOf"
import projectsOf from "@/testUtils/projectsOf"
import timelineOf from "@/testUtils/timelineOf"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

const FIRST_PROJECT = "0192f1a0-0000-7000-8000-000000000001"

function issuesAfter(mutate: (snapshot: ContentSnapshot) => void) {
    const snapshot = buildContentSnapshot()
    mutate(snapshot)
    return validateTranslation(snapshot)
}

describe("validateTranslation", () => {
    it("aceita o conteúdo traduzido, com campo neutro e documento diferentes por idioma", () => {
        expect(issuesAfter(() => undefined)).toEqual([])
    })

    it("reprova campo traduzível igual ao pt-BR", () => {
        const issues = issuesAfter((snapshot) => {
            profileOf(snapshot, "es").role = profileOf(snapshot, "pt-BR").role
        })

        expect(issues).toHaveLength(1)
        expect(issues[0].path).toBe("content/es/profile.json#role")
        expect(issues[0].message).toContain("sem tradução")
        expect(issues[0].message).toContain("Desenvolvedor full stack (pt-BR)")
    })

    it("aceita valor da lista de exceções", () => {
        expect(
            issuesAfter((snapshot) => {
                projectsOf(snapshot, "en")[0].title = "Maps"
                projectsOf(snapshot, "pt-BR")[0].title = "Maps"
                projectsOf(snapshot, "es")[0].title = "Maps"
            })
        ).toEqual([])
    })

    it("reprova valor igual fora da lista de exceções no mesmo campo", () => {
        const issues = issuesAfter((snapshot) => {
            projectsOf(snapshot, "en")[0].title = "Catalog"
            projectsOf(snapshot, "pt-BR")[0].title = "Catalog"
        })

        expect(issues.map((issue) => issue.path)).toEqual([
            "content/en/projects.json#items[0].title"
        ])
    })

    it("reprova item de lista igual ao pt-BR", () => {
        const issues = issuesAfter((snapshot) => {
            const [first] = timelineOf(snapshot, "pt-BR")
            timelineOf(snapshot, "en")[0].responsibilities[0] = first.responsibilities[0]
        })

        expect(issues).toHaveLength(1)
        expect(issues[0].path).toBe("content/en/timeline.json#items[0].responsibilities[0]")
    })

    it("reprova documento igual ao do pt-BR", () => {
        const encoder = new TextEncoder()
        const issues = issuesAfter((snapshot) => {
            const source = `content/pt-BR/projects/${FIRST_PROJECT}/docs/SETUP.md`
            snapshot.files[`content/es/projects/${FIRST_PROJECT}/docs/SETUP.md`] = encoder.encode(
                new TextDecoder().decode(snapshot.files[source])
            )
        })

        expect(issues).toEqual([
            {
                path: `content/es/projects/${FIRST_PROJECT}/docs/SETUP.md`,
                message: "Documento igual ao de pt-BR, sem tradução"
            }
        ])
    })
})
