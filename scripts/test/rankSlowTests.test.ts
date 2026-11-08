// @vitest-environment node
import { describe, expect, it } from "vitest"
import rankSlowTests from "@scripts/e2e/rankSlowTests"

function buildReport() {
    return {
        suites: [
            {
                title: "a.spec.ts",
                file: "a.spec.ts",
                specs: [
                    {
                        title: "lento",
                        file: "a.spec.ts",
                        tests: [
                            {
                                projectName: "desktop-light",
                                results: [{ duration: 1000 }, { duration: 500 }]
                            },
                            { projectName: "mobile-light", results: [{ duration: 300 }] }
                        ]
                    },
                    {
                        title: "rapido",
                        file: "a.spec.ts",
                        tests: [{ projectName: "desktop-light", results: [{ duration: 100 }] }]
                    }
                ],
                suites: [
                    {
                        title: "grupo",
                        file: "a.spec.ts",
                        specs: [
                            {
                                title: "aninhado",
                                file: "a.spec.ts",
                                tests: [
                                    { projectName: "desktop-light", results: [{ duration: 700 }] }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                title: "b.spec.ts",
                file: "b.spec.ts",
                specs: [
                    {
                        title: "outro",
                        file: "b.spec.ts",
                        tests: [{ projectName: "mobile-light", results: [{ duration: 2000 }] }]
                    }
                ]
            }
        ]
    }
}

describe("rankSlowTests", () => {
    it("ordena os testes por duração decrescente somando os retries do mesmo teste", () => {
        const { tests } = rankSlowTests(buildReport(), 10)

        expect(tests.map((test) => [test.title, test.projectName, test.duration])).toEqual([
            ["outro", "mobile-light", 2000],
            ["lento", "desktop-light", 1500],
            ["aninhado", "desktop-light", 700],
            ["lento", "mobile-light", 300],
            ["rapido", "desktop-light", 100]
        ])
    })

    it("limita a lista de testes ao tamanho pedido", () => {
        expect(rankSlowTests(buildReport(), 2).tests).toHaveLength(2)
    })

    it("agrupa a duração por arquivo e por projeto em ordem decrescente", () => {
        const { files, projects } = rankSlowTests(buildReport(), 10)

        expect(files).toEqual([
            { name: "a.spec.ts", duration: 2600, count: 4 },
            { name: "b.spec.ts", duration: 2000, count: 1 }
        ])
        expect(projects).toEqual([
            { name: "desktop-light", duration: 2300, count: 3 },
            { name: "mobile-light", duration: 2300, count: 2 }
        ])
    })

    it("devolve listas vazias para um relatório sem suítes", () => {
        expect(rankSlowTests({ suites: [] }, 20)).toEqual({ tests: [], files: [], projects: [] })
    })

    it("devolve listas vazias quando o relatório não tem o campo de suítes", () => {
        expect(rankSlowTests({}, 20)).toEqual({ tests: [], files: [], projects: [] })
    })
})
