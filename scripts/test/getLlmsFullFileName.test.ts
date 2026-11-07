// @vitest-environment node
import { describe, expect, it } from "vitest"
import getLlmsFullFileName from "@scripts/seo/getLlmsFullFileName"

describe("getLlmsFullFileName", () => {
    it.each([
        ["pt-BR", "llms-full.txt"],
        ["en", "llms-full.en.txt"],
        ["es", "llms-full.es.txt"]
    ] as const)("devolve o arquivo de %s", (language, file) => {
        expect(getLlmsFullFileName(language)).toBe(file)
    })
})
