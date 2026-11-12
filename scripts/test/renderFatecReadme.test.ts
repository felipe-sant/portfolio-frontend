import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import renderFatecReadme from "@scripts/renderFatecReadme"

const template = readFileSync("scripts/fatecReadme.template.md", "utf-8")

describe("renderFatecReadme", () => {
    it("troca os marcadores pela tag e pelo SHA de origem", () => {
        const result = renderFatecReadme(template, { tag: "v1.3.0", sha: "a1b2c3d" })

        expect(result).toContain("v1.3.0")
        expect(result).toContain("a1b2c3d")
    })

    it("cita o workflow fatec-pages.yml com link na tag", () => {
        const result = renderFatecReadme(template, { tag: "v1.3.0", sha: "a1b2c3d" })

        expect(result).toContain("fatec-pages.yml")
        expect(result).toContain(
            "https://github.com/felipe-sant/portfolio-frontend/blob/v1.3.0/.github/workflows/fatec-pages.yml"
        )
    })

    it("referencia as duas capturas em picture", () => {
        const result = renderFatecReadme(template, { tag: "v1.3.0", sha: "a1b2c3d" })

        expect(result).toContain("<picture>")
        expect(result).toContain("docs/readme/home-light.png")
        expect(result).toContain("docs/readme/home-dark.png")
    })

    it("não deixa marcador sem trocar", () => {
        const result = renderFatecReadme(template, { tag: "v1.3.0", sha: "a1b2c3d" })

        expect(result).not.toContain("{{")
    })

    it("troca todas as ocorrências de um marcador", () => {
        const result = renderFatecReadme("{{TAG}} e {{TAG}} em {{SHA}}", {
            tag: "v1.0.1",
            sha: "abcdef1"
        })

        expect(result).toBe("v1.0.1 e v1.0.1 em abcdef1")
    })

    it.each(["v2.0.0", "1.0.0", "v1.0", "v1.0.0-rc1", "", "v1.x.0"])(
        "recusa a tag %j em português",
        (tag) => {
            expect(() => renderFatecReadme(template, { tag, sha: "a1b2c3d" })).toThrow(
                /tag.*v1\.x\.y/i
            )
        }
    )

    it.each(["abc12", "xyz1234", "", "a".repeat(41), "a1b2c3d\n"])(
        "recusa o SHA %j em português",
        (sha) => {
            expect(() => renderFatecReadme(template, { tag: "v1.3.0", sha })).toThrow(/SHA/)
        }
    )

    it("falha se sobrar marcador desconhecido no modelo", () => {
        expect(() =>
            renderFatecReadme("{{TAG}} {{SHA}} {{OUTRO}}", { tag: "v1.3.0", sha: "a1b2c3d" })
        ).toThrow(/marcador/)
    })
})
