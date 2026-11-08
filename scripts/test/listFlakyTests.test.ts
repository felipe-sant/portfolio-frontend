// @vitest-environment node
import { describe, expect, it } from "vitest"
import listFlakyTests from "@scripts/e2e/listFlakyTests"

function buildReport(tests: { status: string; results: { status: string }[] }[]) {
    return {
        suites: [
            {
                title: "e2e/home.spec.ts",
                suites: [
                    {
                        title: "grupo",
                        specs: tests.map((test, index) => ({
                            title: `teste ${index}`,
                            file: "home.spec.ts",
                            tests: [{ projectName: "mobile-light", ...test }]
                        }))
                    }
                ]
            }
        ]
    }
}

describe("listFlakyTests", () => {
    it("lista o teste que passou depois de uma tentativa que falhou", () => {
        const report = buildReport([
            { status: "flaky", results: [{ status: "failed" }, { status: "passed" }] }
        ])

        expect(listFlakyTests(report)).toEqual([
            { title: "teste 0", file: "home.spec.ts", projectName: "mobile-light" }
        ])
    })

    it("não lista teste que passou de primeira, falhou ou foi pulado", () => {
        const report = buildReport([
            { status: "expected", results: [{ status: "passed" }] },
            { status: "unexpected", results: [{ status: "failed" }, { status: "failed" }] },
            { status: "skipped", results: [{ status: "skipped" }] }
        ])

        expect(listFlakyTests(report)).toEqual([])
    })

    it("reconhece o flaky pelas tentativas quando o status do teste não vem", () => {
        const report = buildReport([
            { status: "", results: [{ status: "timedOut" }, { status: "passed" }] }
        ])

        expect(listFlakyTests(report)).toHaveLength(1)
    })

    it("não lança com relatório vazio, sem suites ou que não é objeto", () => {
        expect(listFlakyTests({})).toEqual([])
        expect(listFlakyTests({ suites: [] })).toEqual([])
        expect(listFlakyTests(null)).toEqual([])
        expect(listFlakyTests("texto")).toEqual([])
    })
})
