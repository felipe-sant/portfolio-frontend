import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function runScriptLines(workflow: string): string[] {
    const lines = workflow.split("\n")
    const result: string[] = []
    for (let index = 0; index < lines.length; index++) {
        const match = lines[index].match(/^(\s*)(?:- )?run:\s*(.*)$/)
        if (!match) continue
        if (!/^[|>]/.test(match[2])) {
            result.push(match[2])
            continue
        }
        const indent = match[1].length
        for (let next = index + 1; next < lines.length; next++) {
            const line = lines[next]
            if (line.trim() !== "" && line.length - line.trimStart().length <= indent) break
            result.push(line)
        }
    }
    return result
}

describe("version.yml", () => {
    const workflow = readFileSync(".github/workflows/version.yml", "utf-8")
    const title = "Chore :see_no_evil: Atualiza versão e CHANGELOG"

    it("roda em push na staging e por workflow_dispatch, sem pull_request", () => {
        expect(workflow).toMatch(/^ {4}push:\n {8}branches: \[staging\]/m)
        expect(workflow).toMatch(/^ {4}workflow_dispatch:/m)
        expect(workflow).not.toMatch(/^ {4}pull_request/m)
    })

    it("usa a changesets/action v2 com o script de versão e o título e o commit padronizados", () => {
        expect(workflow).toContain("uses: changesets/action@v2")
        expect(workflow).toContain("version-script: npm run changeset:version")
        expect(workflow).toContain(`commit-message: "${title}"`)
        expect(workflow).toContain(`pr-title: "${title}"`)
    })

    it("tem as permissões mínimas, serializa sem cancelar e faz checkout completo", () => {
        expect(workflow).toMatch(/^permissions:\n {4}contents: write\n {4}pull-requests: write/m)
        expect(workflow).toMatch(/^concurrency:\n {4}group: .*\n {4}cancel-in-progress: false/m)
        expect(workflow).not.toContain("cancel-in-progress: true")
        expect(workflow).toContain("fetch-depth: 0")
        expect(workflow).toContain("github-token: ${{ secrets.GITHUB_TOKEN }}")
    })

    it("não interpola expressões direto em blocos run", () => {
        runScriptLines(workflow).forEach((line) => {
            expect(line).not.toContain("${{")
        })
    })
})

describe("changeset-check.yml", () => {
    const workflow = readFileSync(".github/workflows/changeset-check.yml", "utf-8")

    it("roda em pull_request para a staging e ignora o PR de versão e o de retorno da main", () => {
        expect(workflow).toMatch(/^ {4}pull_request:\n {8}branches: \[staging\]/m)
        expect(workflow).toContain("github.head_ref != 'changeset-release/staging'")
        expect(workflow).toContain("github.head_ref != 'main'")
    })

    it("checa o changeset contra origin/staging com o histórico completo", () => {
        expect(workflow).toContain("npx changeset status --since=origin/staging")
        expect(workflow).toContain("fetch-depth: 0")
    })

    it("tem permissão só de leitura e cancela apenas execuções de PR", () => {
        expect(workflow).toMatch(/^permissions:\n {4}contents: read$/m)
        expect(workflow).toMatch(/^concurrency:\n {4}group: .*\n {4}cancel-in-progress: true/m)
    })
})
