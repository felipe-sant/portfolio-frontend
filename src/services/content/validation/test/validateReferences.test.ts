import { describe, expect, it } from "vitest"
import validateReferences from "@/services/content/validation/validateReferences"
import buildContentSnapshot from "@/testUtils/buildContentSnapshot"
import projectsOf from "@/testUtils/projectsOf"
import timelineOf from "@/testUtils/timelineOf"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

const MISSING = "0192f1a0-0000-7000-8000-0000000000ff"

function messagesAfter(mutate: (snapshot: ContentSnapshot) => void) {
    const snapshot = buildContentSnapshot()
    mutate(snapshot)
    return validateReferences(snapshot).map((issue) => issue.message)
}

describe("validateReferences", () => {
    it("aceita referências existentes", () => {
        expect(messagesAfter(() => undefined)).toEqual([])
    })

    it("reprova projectIds de projeto inexistente", () => {
        const messages = messagesAfter((snapshot) => {
            timelineOf(snapshot, "pt-BR")[0].projectIds = [MISSING]
        })

        expect(messages[0]).toContain("projeto inexistente")
    })

    it("reprova projeto repetido em projectIds", () => {
        const messages = messagesAfter((snapshot) => {
            const [first] = projectsOf(snapshot, "en")
            timelineOf(snapshot, "en")[0].projectIds = [first.id, first.id]
        })

        expect(messages).toEqual([expect.stringContaining("repetido na trajetória")])
    })

    it("reprova relacionado inexistente, consigo mesmo e repetido", () => {
        const messages = messagesAfter((snapshot) => {
            const [first, second] = projectsOf(snapshot, "es")
            first.related = [
                { id: MISSING, reason: "x" },
                { id: first.id, reason: "y" },
                { id: second.id, reason: "z" },
                { id: second.id, reason: "w" }
            ]
        })

        expect(messages).toEqual([
            expect.stringContaining("projeto inexistente"),
            expect.stringContaining("consigo mesmo"),
            expect.stringContaining("Relacionado repetido")
        ])
    })
})
