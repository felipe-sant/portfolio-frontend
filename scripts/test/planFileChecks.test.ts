import { describe, expect, it } from "vitest"
import planFileChecks from "@scripts/claudeHooks/planFileChecks"

const exists = () => true

describe("planFileChecks", () => {
    it("devolve plano vazio para extensão não suportada", () => {
        expect(planFileChecks("/repo/src/logo.png", exists)).toEqual([])
        expect(planFileChecks("/repo/Makefile", exists)).toEqual([])
    })

    it("devolve plano vazio para arquivo inexistente", () => {
        expect(planFileChecks("/repo/src/gone.ts", () => false)).toEqual([])
    })

    it("devolve plano vazio para caminho que não é texto", () => {
        expect(planFileChecks(undefined, exists)).toEqual([])
    })

    it.each([".ts", ".tsx"])("roda prettier e oxlint só no arquivo %s", (extension) => {
        const path = `/repo/src/a${extension}`
        expect(planFileChecks(path, exists)).toEqual([
            { command: "prettier", args: ["--write", path] },
            { command: "oxlint", args: [path] }
        ])
    })

    it.each([".css", ".json", ".md", ".yml", ".html"])("roda só prettier em %s", (extension) => {
        const path = `/repo/docs/a${extension}`
        expect(planFileChecks(path, exists)).toEqual([
            { command: "prettier", args: ["--write", path] }
        ])
    })

    it("preserva caminho com espaços como um único argumento", () => {
        const path = "/repo/my dir/a b.ts"
        const plan = planFileChecks(path, exists)
        expect(plan[0].args).toEqual(["--write", path])
        expect(plan[1].args).toEqual([path])
    })

    it("não roda oxlint em docs/design/prototype", () => {
        const path = "/repo/docs/design/prototype/app.ts"
        expect(planFileChecks(path, exists).map((step) => step.command)).toEqual(["prettier"])
    })
})
