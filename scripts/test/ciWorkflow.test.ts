import { readFileSync } from "node:fs"
import { parse } from "yaml"
import { describe, expect, it } from "vitest"

type Step = {
    name?: string
    run?: string
}

type Job = {
    name?: string
    if?: string
    steps?: Step[]
}

type Workflow = {
    on: {
        push?: { branches?: string[] }
        pull_request?: { branches?: string[] }
        workflow_run?: { branches?: string[] }
    }
    jobs: Record<string, Job>
}

function readWorkflow(name: string): Workflow {
    return parse(readFileSync(`.github/workflows/${name}`, "utf-8")) as Workflow
}

function findStepRun(job: Job | undefined, stepName: string): string {
    return job?.steps?.find((step) => step.name === stepName)?.run ?? ""
}

describe("ci.yml", () => {
    const ci = readWorkflow("ci.yml")

    it("só roda o CI de pull request para a staging", () => {
        expect(ci.on.pull_request?.branches).toEqual(["staging"])
    })

    it("roda o CI completo em push na main e na staging", () => {
        expect(ci.on.push?.branches).toContain("main")
        expect(ci.on.push?.branches).toContain("staging")
    })

    it("roda o CI em push nas branches de hotfix", () => {
        expect(ci.on.push?.branches).toContain("hotfix/**")
    })

    it("mantém os nomes dos checks exigidos pela ruleset", () => {
        expect(ci.jobs.build?.name).toBe("Build")
        expect(ci.jobs.lint?.name).toBe("Lint")
        expect(ci.jobs.test?.name).toBe("Test")
        expect(ci.jobs.e2e?.name).toBe("E2E")
    })

    it("não trata pull request para a main nos passos de escopo", () => {
        const testScope = findStepRun(ci.jobs.test, "Decide test scope")
        const e2eScope = findStepRun(ci.jobs.e2e, "Decide E2E scope")
        expect(testScope).not.toContain('"main"')
        expect(e2eScope).not.toContain('"main"')
    })

    it("mantém push em escopo completo nos dois passos", () => {
        const testScope = findStepRun(ci.jobs.test, "Decide test scope")
        const e2eScope = findStepRun(ci.jobs.e2e, "Decide E2E scope")
        expect(testScope).toContain('if [ "$EVENT_NAME" = "push" ]')
        expect(testScope).toContain("mode=full")
        expect(e2eScope).toContain('if [ "$EVENT_NAME" = "push" ]')
        expect(e2eScope).toContain("mode=full")
    })
})

describe("deploy.yml", () => {
    const deploy = readWorkflow("deploy.yml")

    it("só reage ao CI da main e da staging", () => {
        expect(deploy.on.workflow_run?.branches).toEqual(["main", "staging"])
    })

    it("só publica a partir de CI disparado por push", () => {
        expect(deploy.jobs.production?.if).toContain("workflow_run.event == 'push'")
        expect(deploy.jobs.staging?.if).toContain("workflow_run.event == 'push'")
    })
})
