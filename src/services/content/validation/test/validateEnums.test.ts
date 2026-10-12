import { describe, expect, it } from "vitest"
import validateEnums from "@/services/content/validation/validateEnums"
import buildContentSnapshot from "@/testUtils/buildContentSnapshot"
import profileOf from "@/testUtils/profileOf"
import projectsOf from "@/testUtils/projectsOf"
import timelineOf from "@/testUtils/timelineOf"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

function pathsAfter(mutate: (snapshot: ContentSnapshot) => void) {
    const snapshot = buildContentSnapshot()
    mutate(snapshot)
    return validateEnums(snapshot).map((issue) => issue.path)
}

describe("validateEnums", () => {
    it("aceita valores do enum", () => {
        expect(pathsAfter(() => undefined)).toEqual([])
    })

    it("reprova types com código fora do enum, vazio ou repetido", () => {
        const paths = pathsAfter((snapshot) => {
            const projects = projectsOf(snapshot, "pt-BR")
            Object.assign(projects[0], { types: ["fullstack"] })
            projects[1].types = []
            Object.assign(projectsOf(snapshot, "en")[0], { types: ["web", "web"] })
        })

        expect(paths).toEqual([
            "content/pt-BR/projects.json#items[0].types[0]",
            "content/pt-BR/projects.json#items[1].types",
            "content/en/projects.json#items[0].types[1]"
        ])
    })

    it("reprova category, status e format fora do enum", () => {
        const paths = pathsAfter((snapshot) => {
            const [project] = projectsOf(snapshot, "es")
            Object.assign(project, { category: "hobby", status: "inProduction" })
            Object.assign(project.documents[0], { format: "pdf" })
        })

        expect(paths).toEqual([
            "content/es/projects.json#items[0].category",
            "content/es/projects.json#items[0].status",
            "content/es/projects.json#items[0].documents[0].format"
        ])
    })

    it("reprova category de stack do projeto e do perfil e kind da trajetória", () => {
        const paths = pathsAfter((snapshot) => {
            Object.assign(projectsOf(snapshot, "pt-BR")[0].stack[0], { category: "mobile" })
            Object.assign(profileOf(snapshot, "pt-BR").stack[0], { category: "mobile" })
            Object.assign(timelineOf(snapshot, "pt-BR")[0], { kind: "volunteer" })
        })

        expect(paths).toEqual([
            "content/pt-BR/projects.json#items[0].stack[0].category",
            "content/pt-BR/timeline.json#items[0].kind",
            "content/pt-BR/profile.json#stack[0].category"
        ])
    })
})
