// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const INDEX_HTML = readFileSync(join(ROOT, "index.html"), "utf8")
const HOME_PT_BR: { meta: { description: string } } = JSON.parse(
    readFileSync(join(ROOT, "src", "locales", "pt-BR", "home.json"), "utf8")
)

describe("metadados de index.html", () => {
    it("usa a description da Início em pt-BR", () => {
        const match = INDEX_HTML.match(/<meta\s+name="description"\s+content="([^"]*)"/)

        expect(match?.[1]).toBe(HOME_PT_BR.meta.description)
    })

    it("usa o cargo Júnior no title", () => {
        const match = INDEX_HTML.match(/<title>([^<]*)<\/title>/)

        expect(match?.[1]).toBe("Luiz Felipe dos Santos · Desenvolvedor full stack Júnior")
    })
})
