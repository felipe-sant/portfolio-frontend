import { readFileSync } from "node:fs"
import { parse } from "yaml"
import { describe, expect, it } from "vitest"

type Step = { name?: string; run?: string }
type Workflow = { jobs: Record<string, { steps?: Step[] }> }

function readWorkflow(name: string): Workflow {
    return parse(readFileSync(`.github/workflows/${name}`, "utf-8")) as Workflow
}

function stepIndex(steps: Step[], predicate: (step: Step) => boolean): number {
    return steps.findIndex(predicate)
}

function guardIndex(steps: Step[], target: string): number {
    return stepIndex(steps, (step) => step.run === `npm run check:contact-form ${target}`)
}

describe("check:contact-form nos workflows", () => {
    it("o job Build do ci.yml confere o dist/ depois do build", () => {
        const steps = readWorkflow("ci.yml").jobs.build?.steps ?? []
        const build = stepIndex(steps, (step) => step.run === "npm run build")

        expect(guardIndex(steps, "dist")).toBeGreaterThan(build)
    })

    it("o job build do fatec-pages.yml confere o dist/ depois do build:fatec e antes do upload", () => {
        const steps = readWorkflow("fatec-pages.yml").jobs.build?.steps ?? []
        const build = stepIndex(steps, (step) => step.run === "npm run build:fatec")
        const upload = stepIndex(steps, (step) => step.name === "Upload artifact")
        const guard = guardIndex(steps, "dist")

        expect(build).toBeGreaterThan(-1)
        expect(guard).toBeGreaterThan(build)
        expect(guard).toBeLessThan(upload)
    })

    it.each(["production", "staging"])(
        "o job %s do deploy.yml confere .vercel/output/static depois do vercel build e antes do deploy",
        (job) => {
            const steps = readWorkflow("deploy.yml").jobs[job]?.steps ?? []
            const build = stepIndex(steps, (step) => step.name === "Build")
            const deploy = stepIndex(steps, (step) => step.name === "Deploy")
            const guard = guardIndex(steps, ".vercel/output/static")

            expect(guard).toBeGreaterThan(build)
            expect(guard).toBeLessThan(deploy)
        }
    )

    it("nenhum passo do guard aponta para dist-form e o ci.yml segue montando o dist-form pelo build:fatec:form", () => {
        const names = ["ci.yml", "fatec-pages.yml", "deploy.yml"]
        const runs = names.flatMap((name) =>
            Object.values(readWorkflow(name).jobs).flatMap((job) =>
                (job.steps ?? []).map((step) => step.run ?? "")
            )
        )
        const ciRuns = Object.values(readWorkflow("ci.yml").jobs).flatMap((job) =>
            (job.steps ?? []).map((step) => step.run ?? "")
        )

        expect(runs.filter((run) => run.includes("check:contact-form"))).not.toEqual([])
        expect(
            runs.filter((run) => run.includes("check:contact-form") && run.includes("dist-form"))
        ).toEqual([])
        expect(ciRuns).toContain("npm run build:fatec:form")
    })
})
