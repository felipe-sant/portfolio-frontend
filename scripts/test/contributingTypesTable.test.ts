// @vitest-environment node
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readTypeRows(path: string): string[][] {
    const lines = readFileSync(path, "utf-8").split("\n")
    const header = lines.findIndex((line) => /^\|\s*Tipo\s*\|/.test(line))
    const rows: string[][] = []
    for (const line of lines.slice(header + 2)) {
        if (!line.startsWith("|")) {
            break
        }
        const cells = line
            .split("|")
            .slice(1, -1)
            .map((cell) => cell.trim())
        rows.push([cells[0], cells[1]])
    }
    return rows
}

const contributing = readFileSync("CONTRIBUTING.md", "utf-8")

describe("CONTRIBUTING.md e CLAUDE.md", () => {
    it("têm a mesma lista de tipos e ícones, na mesma ordem", () => {
        const fromContributing = readTypeRows("CONTRIBUTING.md")
        expect(fromContributing).toHaveLength(11)
        expect(readTypeRows(".claude/CLAUDE.md")).toEqual(fromContributing)
    })

    it("o CONTRIBUTING não manda usar label de tipo do GitHub", () => {
        expect(contributing).not.toMatch(/enhancement|documentation/)
    })

    it("o CONTRIBUTING exige changeset e a verificação antes do PR", () => {
        expect(contributing).toContain("npm run changeset")
        expect(contributing).toContain("npm run lint")
        expect(contributing).toContain("npm test -- --run")
        expect(contributing).toContain("npm run build")
    })
})
