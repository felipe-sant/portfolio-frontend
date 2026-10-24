import { describe, expect, it } from "vitest"
import getTargetFile from "@scripts/prerender/getTargetFile"

describe("getTargetFile", () => {
    it.each([
        ["pt-BR", "pt-BR.html"],
        ["en", "en.html"],
        ["es", "es.html"],
        ["en/projects", "en/projects.html"],
        ["es/about", "es/about.html"],
        ["pt-BR/contact", "pt-BR/contact.html"],
        ["en/projects/0192f1a0", "en/projects/0192f1a0.html"],
        ["en/projects/0192f1a0/docs/SETUP.md", "en/projects/0192f1a0/docs/SETUP.md.html"],
        ["en/projects/0192f1a0/docs/My%20Doc.md", "en/projects/0192f1a0/docs/My Doc.md.html"],
        ["not-found", "not-found.html"]
    ])("converte %s em %s", (path, file) => {
        expect(getTargetFile(path)).toBe(file)
    })

    it("nunca gera pasta com index.html para um documento", () => {
        expect(getTargetFile("en/projects/1/docs/SETUP.md")).not.toContain("index.html")
    })

    it.each([[""], ["en/"]])("falha em português para o caminho %j", (path) => {
        expect(() => getTargetFile(path)).toThrow(/não gera arquivo/)
    })
})
