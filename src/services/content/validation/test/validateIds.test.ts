import { describe, expect, it } from "vitest"
import validateIds from "@/services/content/validation/validateIds"
import buildContentSnapshot from "@/testUtils/buildContentSnapshot"
import projectsOf from "@/testUtils/projectsOf"
import timelineOf from "@/testUtils/timelineOf"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

function messagesAfter(mutate: (snapshot: ContentSnapshot) => void) {
    const snapshot = buildContentSnapshot()
    mutate(snapshot)
    return validateIds(snapshot).map((issue) => `${issue.path} ${issue.message}`)
}

describe("validateIds", () => {
    it("aceita ids UUID v7 únicos", () => {
        expect(messagesAfter(() => undefined)).toEqual([])
    })

    it("reprova id v4, maiúsculo e vazio", () => {
        const messages = messagesAfter((snapshot) => {
            const projects = projectsOf(snapshot, "pt-BR")
            projects[0].id = "550e8400-e29b-41d4-a716-446655440000"
            projects[1].id = "0192F1A0-0000-7000-8000-000000000002"
            timelineOf(snapshot, "pt-BR")[0].id = ""
        })

        expect(messages).toHaveLength(3)
        expect(messages[0]).toContain("projects.json#items[0].id")
        expect(messages[0]).toContain("UUID v7")
    })

    it("reprova id de projeto repetido", () => {
        const messages = messagesAfter((snapshot) => {
            const projects = projectsOf(snapshot, "es")
            projects[1].id = projects[0].id
        })

        expect(messages[0]).toContain("Id repetido")
    })

    it("reprova id de item de trajetória e de documento repetidos", () => {
        const messages = messagesAfter((snapshot) => {
            const timeline = timelineOf(snapshot, "en")
            timeline[1].id = timeline[0].id
            const documents = projectsOf(snapshot, "en")[0].documents
            documents[1].id = documents[0].id
        })

        expect(messages).toHaveLength(2)
    })

    it("reprova id de certificado fora do formato", () => {
        const messages = messagesAfter((snapshot) => {
            timelineOf(snapshot, "pt-BR")[1].certificates[0].id = "diploma"
        })

        expect(messages[0]).toContain("certificates[0].id")
    })

    it("aceita o mesmo certificado em dois itens, mas reprova nome ou emissor diferentes", () => {
        const snapshot = buildContentSnapshot()
        const timeline = timelineOf(snapshot, "pt-BR")
        timeline[2].certificates = [{ ...timeline[1].certificates[0] }]

        expect(validateIds(snapshot)).toEqual([])

        timeline[2].certificates[0].issuer = "Outra"

        expect(validateIds(snapshot)[0].message).toContain("name ou issuer diferentes")
    })
})
