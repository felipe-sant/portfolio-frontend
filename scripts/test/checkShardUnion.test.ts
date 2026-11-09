// @vitest-environment node
import { describe, expect, it } from "vitest"
import checkShardUnion from "@scripts/e2e/checkShardUnion"
import listTestIds from "@scripts/e2e/listTestIds"

describe("checkShardUnion", () => {
    it("não acusa nada quando a união é igual ao total sem repetição", () => {
        const result = checkShardUnion(["a", "b", "c"], [["a", "c"], ["b"]])

        expect(result).toEqual({ missing: [], duplicated: [], extra: [] })
    })

    it("acusa como perdido o teste ausente de todas as fatias", () => {
        const result = checkShardUnion(["a", "b", "c"], [["a"], ["c"]])

        expect(result.missing).toEqual(["b"])
        expect(result.duplicated).toEqual([])
    })

    it("acusa como duplicado o teste presente em duas fatias", () => {
        const result = checkShardUnion(["a", "b"], [["a", "b"], ["b"]])

        expect(result.missing).toEqual([])
        expect(result.duplicated).toEqual(["b"])
    })

    it("devolve todos como perdidos quando não há fatias", () => {
        expect(checkShardUnion(["a", "b"], []).missing).toEqual(["a", "b"])
    })

    it("acusa teste que só existe numa fatia e não no total", () => {
        expect(checkShardUnion(["a"], [["a", "x"]]).extra).toEqual(["x"])
    })
})

function spec(title: string, projects: string[]) {
    return {
        title,
        file: "x.spec.ts",
        line: 10,
        tests: projects.map((projectName) => ({ projectName }))
    }
}

describe("listTestIds", () => {
    it("diferencia o mesmo título em projetos diferentes, inclusive independent e contact-form", () => {
        const report = {
            suites: [
                {
                    specs: [],
                    suites: [
                        {
                            specs: [
                                spec("mesmo título", [
                                    "mobile-light",
                                    "independent",
                                    "contact-form-mobile-light"
                                ])
                            ]
                        }
                    ]
                }
            ]
        }

        const ids = listTestIds(report)

        expect(new Set(ids).size).toBe(3)
        expect(ids).toHaveLength(3)
    })

    it("diferencia o mesmo título e linha em describes de idiomas diferentes", () => {
        const report = {
            suites: [
                {
                    title: "x.spec.ts",
                    suites: [
                        { title: "em pt-BR", specs: [spec("igual", ["desktop-light"])] },
                        { title: "em en", specs: [spec("igual", ["desktop-light"])] }
                    ]
                }
            ]
        }

        expect(new Set(listTestIds(report)).size).toBe(2)
    })

    it("devolve lista vazia para relatório sem suítes", () => {
        expect(listTestIds({})).toEqual([])
    })
})
