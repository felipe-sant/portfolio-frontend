import { describe, expect, it } from "vitest"
import buildTimelineItem from "@/testUtils/buildTimelineItem"
import pickCurrentStatus from "@/utils/pickCurrentStatus"

describe("pickCurrentStatus", () => {
    it("devolve vazio para lista vazia", () => {
        expect(pickCurrentStatus([])).toEqual({ working: undefined, studying: undefined })
    })

    it("escolhe a experiência para o primeiro card e a formação para o segundo", () => {
        const job = buildTimelineItem({ id: "job", kind: "experience" })
        const degree = buildTimelineItem({ id: "degree", kind: "education" })

        expect(pickCurrentStatus([degree, job])).toEqual({ working: job, studying: degree })
    })

    it("aceita um curso no segundo card", () => {
        const course = buildTimelineItem({ id: "course", kind: "course" })

        expect(pickCurrentStatus([course]).studying).toBe(course)
    })

    it("devolve só o tipo que existe", () => {
        const job = buildTimelineItem({ kind: "experience" })

        expect(pickCurrentStatus([job])).toEqual({ working: job, studying: undefined })
    })

    it("vale o primeiro da resposta quando há vários do mesmo tipo", () => {
        const first = buildTimelineItem({ id: "first", kind: "experience" })
        const second = buildTimelineItem({ id: "second", kind: "experience" })

        expect(pickCurrentStatus([first, second]).working).toBe(first)
    })
})
