import { describe, expect, it } from "vitest"
import parseMergedPullNumbers from "@scripts/parseMergedPullNumbers"

describe("parseMergedPullNumbers", () => {
    it("devolve lista vazia para lista vazia", () => {
        expect(parseMergedPullNumbers([])).toEqual([])
    })

    it("ignora assunto sem número de PR", () => {
        expect(parseMergedPullNumbers(["Fix :bug: corrige algo"])).toEqual([])
    })

    it("lê o número do commit de merge", () => {
        expect(parseMergedPullNumbers(["Merge pull request #176 from felipe-sant/x"])).toEqual([
            176
        ])
    })

    it("lê o número do sufixo de squash", () => {
        expect(parseMergedPullNumbers(["Feat :sparkles: Titulo (#42)"])).toEqual([42])
    })

    it("devolve cada número uma vez e em ordem crescente", () => {
        expect(
            parseMergedPullNumbers([
                "Merge pull request #30 from a/b",
                "Titulo (#7)",
                "Outro (#30)"
            ])
        ).toEqual([7, 30])
    })
})
