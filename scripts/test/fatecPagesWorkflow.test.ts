import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const workflow = readFileSync(".github/workflows/fatec-pages.yml", "utf-8")
const lines = workflow.split("\n")
const publishStart = lines.findIndex((line) => /^ {4}publish:/.test(line))
const publishJob = publishStart === -1 ? "" : lines.slice(publishStart).join("\n")
const buildJob = lines.slice(0, publishStart === -1 ? lines.length : publishStart).join("\n")

function runScriptLines(job: string): string[] {
    const jobLines = job.split("\n")
    const result: string[] = []
    for (let index = 0; index < jobLines.length; index++) {
        const match = jobLines[index].match(/^(\s*)(?:- )?run:\s*(.*)$/)
        if (!match) continue
        if (!/^[|>]/.test(match[2])) {
            result.push(match[2])
            continue
        }
        const indent = match[1].length
        for (let next = index + 1; next < jobLines.length; next++) {
            const line = jobLines[next]
            if (line.trim() !== "" && line.length - line.trimStart().length <= indent) break
            result.push(line)
        }
    }
    return result
}

describe("fatec-pages.yml", () => {
    it("tem o job publish dependente do build e só roda em tag de release", () => {
        expect(publishJob).toMatch(/needs: build/)
        expect(publishJob).toContain("if: needs.build.outputs.is-release == 'true'")
    })

    it("não tem gatilho de push nem de pull request", () => {
        expect(workflow).not.toMatch(/^ {4}(push|pull_request|release):/m)
    })

    it("classifica a tag por env e mantém o padrão v1.x.y", () => {
        expect(workflow).toContain("TAG: ${{ inputs.tag }}")
        expect(workflow).toContain("^v1\\.[0-9]+\\.[0-9]+$")
    })

    it("baixa o artefato fatec-pages, faz checkout da Fatec com o token e chama o script", () => {
        expect(publishJob).toMatch(/actions\/download-artifact@v7/)
        expect(publishJob).toMatch(/name: fatec-pages/)
        expect(publishJob).toContain("repository: fatec-jacarei-dsm-portfolio/ra2581392423047")
        expect(publishJob).toMatch(/ref: main/)
        expect(publishJob).toContain("token: ${{ secrets.FATEC_PAGES_TOKEN }}")
        expect(publishJob).toContain("path: fatec-repository")
        expect(publishJob).toContain("npm run publish:fatec:docs")
    })

    it("nunca força o push", () => {
        expect(workflow).toContain("git push origin main")
        expect(workflow).not.toMatch(/--force|--force-with-lease|git push.* -f\b/)
    })

    it("só faz commit quando há mudança no destino", () => {
        expect(publishJob).toContain("git status --porcelain")
    })

    it("mantém o segredo só em with ou env e a tag só em env", () => {
        const secretLines = lines.filter((line) => line.includes("secrets.FATEC_PAGES_TOKEN"))
        expect(secretLines.length).toBeGreaterThan(0)
        for (const line of secretLines) {
            expect(line).toMatch(/^\s+(token|FATEC_PAGES_TOKEN):/)
        }
        const tagLines = lines.filter((line) => line.includes("inputs.tag"))
        for (const line of tagLines) {
            expect(line).toMatch(/^\s+TAG: \$\{\{ inputs\.tag \}\}$|group: |ref: refs\/tags\//)
        }
        expect(runScriptLines(publishJob).filter((line) => line.includes("${{"))).toEqual([])
    })

    it("mantém permissions contents read e o build sem segredo", () => {
        expect(workflow).toMatch(/^permissions:\n {4}contents: read$/m)
        expect(buildJob).not.toContain("secrets.")
    })

    it("só publica se o commit da tag está na main deste repositório", () => {
        const guardIndex = publishJob.indexOf("compare/$TAG...main")
        expect(guardIndex).toBeGreaterThan(-1)
        expect(publishJob.indexOf("fatec-jacarei-dsm-portfolio")).toBeGreaterThan(guardIndex)
        expect(publishJob).toContain("repos/$REPOSITORY/compare/$TAG...main")
        expect(publishJob).toContain("REPOSITORY: ${{ github.repository }}")
        expect(publishJob).toContain('"$status" != "ahead"')
    })

    it("usa o token do GitHub só no passo da guarda, com contents read", () => {
        expect(publishJob).toContain("GH_TOKEN: ${{ github.token }}")
        expect(workflow.match(/github\.token/g)).toHaveLength(1)
        expect(workflow).toMatch(/^permissions:\n {4}contents: read$/m)
    })

    it("faz checkout deste repositório na tag, sem persistir credenciais", () => {
        const checkout = publishJob.split("- name: Checkout\n")[1].split("- name:")[0]
        expect(checkout).toContain("ref: refs/tags/${{ inputs.tag }}")
        expect(checkout).toContain("persist-credentials: false")
    })

    it("prepara o Chromium do job de build por npm run playwright:install", () => {
        expect(buildJob).toMatch(/- name: Install Chromium\n\s+run: npm run playwright:install\n/)
        expect(buildJob).not.toContain("npx playwright install")
        expect(buildJob).not.toContain("--with-deps")
    })

    it("resolve o SHA de origem na tag e o passa por env, nunca no run", () => {
        expect(publishJob).toContain("git rev-parse --short HEAD")
        expect(publishJob).toContain("ORIGIN_SHA: ${{ steps.origin.outputs.sha }}")
        expect(runScriptLines(publishJob).filter((line) => line.includes("${{"))).toEqual([])
    })

    it("grava o README depois do docs e antes do commit", () => {
        const docs = publishJob.indexOf("npm run publish:fatec:docs")
        const readme = publishJob.indexOf("npm run publish:fatec:readme")
        const commit = publishJob.indexOf("- name: Commit and push")

        expect(readme).toBeGreaterThan(docs)
        expect(commit).toBeGreaterThan(readme)
    })

    it("passa tag e SHA ao passo do README por env", () => {
        const step = publishJob.split("- name: Write README\n")[1].split("- name:")[0]

        expect(step).toContain("TAG: ${{ inputs.tag }}")
        expect(step).toContain("ORIGIN_SHA: ${{ steps.origin.outputs.sha }}")
        expect(step).toContain("npm run publish:fatec:readme -- fatec-repository")
    })

    it("mantém o assunto do commit e grava a linha de origem", () => {
        const step = publishJob.split("- name: Commit and push\n")[1]

        expect(step).toContain("TAG: ${{ inputs.tag }}")
        expect(step).toContain("ORIGIN_SHA: ${{ steps.origin.outputs.sha }}")
        expect(step).toContain('-m "Publica a $TAG do portfólio"')
        expect(step).toContain('-m "Origem: felipe-sant/portfolio-frontend@$ORIGIN_SHA (tag $TAG)"')
    })

    it("adiciona ao commit só docs e README.md", () => {
        const addLines = runScriptLines(publishJob).filter((line) => line.includes("git add"))

        expect(addLines.map((line) => line.trim())).toEqual(["git add --all docs README.md"])
    })
})
