import { describe, expect, it } from "vitest"
import validateDates from "@/services/content/validation/validateDates"
import buildContentSnapshot from "@/testUtils/buildContentSnapshot"
import profileOf from "@/testUtils/profileOf"
import projectsOf from "@/testUtils/projectsOf"
import timelineOf from "@/testUtils/timelineOf"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

function pathsAfter(mutate: (snapshot: ContentSnapshot) => void) {
    const snapshot = buildContentSnapshot()
    mutate(snapshot)
    return validateDates(snapshot).map((issue) => issue.path)
}

describe("validateDates", () => {
    it("aceita as datas válidas", () => {
        expect(pathsAfter(() => undefined)).toEqual([])
    })

    it.each(["2026-13", "2026-3", "2026-03-01", "março", ""])("reprova date %j", (date) => {
        expect(
            pathsAfter((snapshot) => {
                projectsOf(snapshot, "pt-BR")[0].date = date
            })
        ).toEqual(["content/pt-BR/projects.json#items[0].date"])
    })

    it.each(["2026-02-30", "2026-09", "30/09/2026"])("reprova updatedAt %j", (value) => {
        expect(
            pathsAfter((snapshot) => {
                projectsOf(snapshot, "en")[0].updatedAt = value
            })
        ).toEqual(["content/en/projects.json#items[0].updatedAt"])
    })

    it("reprova updatedAt de documento inválido", () => {
        expect(
            pathsAfter((snapshot) => {
                projectsOf(snapshot, "es")[0].documents[0].updatedAt = "ontem"
            })
        ).toEqual(["content/es/projects.json#items[0].documents[0].updatedAt"])
    })

    it.each(["2026-02-30", "07/2026"])("reprova updatedAt %j do perfil", (value) => {
        const snapshot = buildContentSnapshot()
        profileOf(snapshot, "es").updatedAt = value

        expect(validateDates(snapshot)).toEqual([
            {
                path: "content/es/profile.json#updatedAt",
                message: `Data fora do formato AAAA-MM-DD: ${JSON.stringify(value)}`
            }
        ])
    })

    it("reprova projeto sem updatedAt", () => {
        const snapshot = buildContentSnapshot()
        Reflect.deleteProperty(projectsOf(snapshot, "pt-BR")[1], "updatedAt")

        expect(validateDates(snapshot)).toEqual([
            {
                path: "content/pt-BR/projects.json#items[1].updatedAt",
                message: "Campo obrigatório ausente"
            }
        ])
    })

    it("reprova documento que não é README.md sem updatedAt e aceita o README.md sem", () => {
        const snapshot = buildContentSnapshot()
        const documents = projectsOf(snapshot, "en")[0].documents
        Reflect.deleteProperty(documents[0], "updatedAt")
        Reflect.deleteProperty(documents[1], "updatedAt")

        expect(validateDates(snapshot)).toEqual([
            {
                path: "content/en/projects.json#items[0].documents[1].updatedAt",
                message: "Campo obrigatório ausente"
            }
        ])
    })

    it("reprova start e end inválidos e end antes de start", () => {
        const paths = pathsAfter((snapshot) => {
            const timeline = timelineOf(snapshot, "pt-BR")
            timeline[0].start = "2024-6"
            timeline[1].end = "2022-12"
            timeline[2].end = "2025"
        })

        expect(paths).toEqual([
            "content/pt-BR/timeline.json#items[0].start",
            "content/pt-BR/timeline.json#items[1].end",
            "content/pt-BR/timeline.json#items[2].end"
        ])
    })
})
