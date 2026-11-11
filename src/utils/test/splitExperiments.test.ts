import { describe, expect, it } from "vitest"
import buildProjectSummary from "@/testUtils/buildProjectSummary"
import splitExperiments from "@/utils/splitExperiments"

describe("splitExperiments", () => {
    it("separa principais e experimentos mantendo a ordem recebida", () => {
        const a = buildProjectSummary({ id: "a", experiment: false })
        const b = buildProjectSummary({ id: "b", experiment: true })
        const c = buildProjectSummary({ id: "c", experiment: false })
        const d = buildProjectSummary({ id: "d", experiment: true })

        const result = splitExperiments([a, b, c, d])

        expect(result.main).toEqual([a, c])
        expect(result.experiments).toEqual([b, d])
    })

    it("não reordena nem filtra: a união tem os mesmos itens", () => {
        const items = [
            buildProjectSummary({ id: "z", experiment: false }),
            buildProjectSummary({ id: "y", experiment: false })
        ]

        const result = splitExperiments(items)

        expect(result.main).toEqual(items)
        expect(result.experiments).toEqual([])
    })

    it("devolve listas vazias para entrada vazia", () => {
        expect(splitExperiments([])).toEqual({ main: [], experiments: [] })
    })
})
