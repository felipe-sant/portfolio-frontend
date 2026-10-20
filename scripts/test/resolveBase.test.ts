import { describe, expect, it } from "vitest"
import resolveBase from "@scripts/resolveBase"

describe("resolveBase", () => {
    it.each([[undefined], [""], ["/"]])("devolve / para %j", (value) => {
        expect(resolveBase(value)).toBe("/")
    })

    it.each([
        ["ra2581392423047"],
        ["/ra2581392423047"],
        ["ra2581392423047/"],
        ["/ra2581392423047/"]
    ])("normaliza %s para /ra2581392423047/", (value) => {
        expect(resolveBase(value)).toBe("/ra2581392423047/")
    })

    it("mantém subcaminhos aninhados", () => {
        expect(resolveBase("a/b")).toBe("/a/b/")
    })

    it.each([["/a//b/"], ["/../a/"], ["/a b/"], ["/a?x/"], ["/a#x/"], ["//"]])(
        "rejeita %j com mensagem em português",
        (value) => {
            expect(() => resolveBase(value)).toThrow(/BASE_PATH inválido/)
        }
    )
})
