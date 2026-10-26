import { describe, expect, it } from "vitest"
import buildPath from "@/routers/buildPath"
import ROUTES from "@/routers/paths"

describe("buildPath", () => {
    it.each([
        ["pt-BR", "/pt-BR"],
        ["en", "/en"],
        ["es", "/es"]
    ] as const)("monta a Início em %s", (language, expected) => {
        expect(buildPath(ROUTES.home, language)).toBe(expected)
    })

    it("substitui o :id de um caminho parametrizado", () => {
        expect(buildPath("/projects/:id", "en", { id: "0190-abc" })).toBe("/en/projects/0190-abc")
    })

    it("substitui id e documento", () => {
        expect(
            buildPath("/projects/:id/docs/:name", "pt-BR", {
                id: "0190-abc",
                name: "architecture.md"
            })
        ).toBe("/pt-BR/projects/0190-abc/docs/architecture.md")
    })

    it("monta o projeto e o documento pelos caminhos de ROUTES", () => {
        expect(buildPath(ROUTES.project, "en", { id: "0190-abc" })).toBe("/en/projects/0190-abc")
        expect(buildPath(ROUTES.projectDocument, "es", { id: "0190-abc", name: "SETUP.md" })).toBe(
            "/es/projects/0190-abc/docs/SETUP.md"
        )
    })
})
