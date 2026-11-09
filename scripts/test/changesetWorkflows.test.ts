import { readFileSync } from "node:fs"
import { parse } from "yaml"
import { describe, expect, it } from "vitest"

type Step = {
    run?: string
}

type Job = {
    steps?: Step[]
}

type Workflow = {
    jobs: Record<string, Job>
}

function readWorkflow(name: string): Workflow {
    return parse(readFileSync(`.github/workflows/${name}`, "utf-8")) as Workflow
}

function runScripts(workflow: Workflow): string[] {
    return Object.values(workflow.jobs).flatMap((job) =>
        (job.steps ?? []).flatMap((step) => (step.run === undefined ? [] : [step.run]))
    )
}

describe("version.yml", () => {
    it("não interpola expressões direto em blocos run", () => {
        runScripts(readWorkflow("version.yml")).forEach((script) => {
            expect(script).not.toContain("${{")
        })
    })
})

describe("release.yml", () => {
    it("só cria tag e Release no passo condicional", () => {
        const scripts = runScripts(readWorkflow("release.yml"))
        const creators = scripts.filter((script) =>
            /gh release create|git tag|git push/.test(script)
        )

        expect(creators).toHaveLength(1)
        expect(creators[0]).toContain("gh release create")
        scripts.forEach((script) => {
            expect(script).not.toContain("${{")
        })
    })
})
