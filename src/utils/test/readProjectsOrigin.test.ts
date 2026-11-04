import { describe, expect, it } from "vitest"
import readProjectsOrigin from "@/utils/readProjectsOrigin"

describe("readProjectsOrigin", () => {
    it.each([undefined, null, "texto", 3, {}, { fromProjects: false }, { fromProjects: "true" }])(
        "devolve undefined sem a marca em %j",
        (state) => {
            expect(readProjectsOrigin(state)).toBeUndefined()
        }
    )

    it("devolve zero passos com a marca e sem contador", () => {
        expect(readProjectsOrigin({ fromProjects: true })).toEqual({ documentSteps: 0 })
    })

    it("devolve o contador quando é número e zero quando não é", () => {
        expect(readProjectsOrigin({ fromProjects: true, documentSteps: 2 })).toEqual({
            documentSteps: 2
        })
        expect(readProjectsOrigin({ fromProjects: true, documentSteps: "2" })).toEqual({
            documentSteps: 0
        })
    })
})
