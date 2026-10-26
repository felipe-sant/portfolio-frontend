import { describe, expect, it } from "vitest"
import parseCodeFenceTitle from "@/utils/parseCodeFenceTitle"

describe("parseCodeFenceTitle", () => {
    it("devolve o arquivo do title", () => {
        expect(parseCodeFenceTitle('title="src/group.ts"')).toBe("src/group.ts")
        expect(parseCodeFenceTitle('foo title="a b.ts" bar')).toBe("a b.ts")
    })

    it("devolve undefined sem title", () => {
        expect(parseCodeFenceTitle(undefined)).toBeUndefined()
        expect(parseCodeFenceTitle(null)).toBeUndefined()
        expect(parseCodeFenceTitle("")).toBeUndefined()
        expect(parseCodeFenceTitle("linhas=3")).toBeUndefined()
    })

    it("devolve undefined com aspas desbalanceadas ou título vazio", () => {
        expect(parseCodeFenceTitle('title="src/group.ts')).toBeUndefined()
        expect(parseCodeFenceTitle('title=src/group.ts"')).toBeUndefined()
        expect(parseCodeFenceTitle('title=""')).toBeUndefined()
    })
})
