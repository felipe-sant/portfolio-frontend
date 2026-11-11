import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, writeFileSync, chmodSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { parse } from "yaml"
import { describe, expect, it } from "vitest"

type Step = {
    id?: string
    name?: string
    run?: string
    uses?: string
    if?: string
    "continue-on-error"?: boolean
    with?: Record<string, string>
    env?: Record<string, string>
}

type Job = {
    name?: string
    if?: string
    needs?: string | string[]
    strategy?: { "fail-fast"?: boolean; matrix?: string }
    outputs?: Record<string, string>
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

    it("dá o nome E2E só ao agregador e E2E shard às fatias", () => {
        const names = Object.entries(ci.jobs).filter(([, job]) => job.name === "E2E")

        expect(names.map(([key]) => key)).toEqual(["e2e"])
        expect(ci.jobs["e2e-shard"]?.name).toMatch(/^E2E shard /)
        expect(ci.jobs.scope?.name).toBe("E2E scope")
    })

    it("não trata pull request para a main nos passos de escopo", () => {
        const testScope = findStepRun(ci.jobs.test, "Decide test scope")
        const e2eScope = findStepRun(ci.jobs.scope, "Decide E2E scope")
        expect(testScope).not.toContain('"main"')
        expect(e2eScope).not.toContain('"main"')
    })

    it("mantém push em escopo completo nos dois passos", () => {
        const testScope = findStepRun(ci.jobs.test, "Decide test scope")
        const e2eScope = findStepRun(ci.jobs.scope, "Decide E2E scope")
        expect(testScope).toContain('if [ "$EVENT_NAME" = "push" ]')
        expect(testScope).toContain("mode=full")
        expect(e2eScope).toContain('if [ "$EVENT_NAME" = "push" ]')
        expect(e2eScope).toContain("mode=full")
    })
})

describe("ci.yml, preparação do navegador", () => {
    const ci = readWorkflow("ci.yml")

    it.each(["test", "e2e-shard"])("o passo Install Chromium do job %s usa npm run playwright:install", (jobKey) => {
        expect(findStepRun(ci.jobs[jobKey], "Install Chromium")).toBe("npm run playwright:install")
    })

    it.each(["test", "e2e-shard"])("nenhum passo de teste do job %s passa por playwright:install", (jobKey) => {
        const testSteps = (ci.jobs[jobKey]?.steps ?? []).filter((step) =>
            /test:cov|vitest|playwright test/.test(step.run ?? "")
        )

        expect(testSteps.length).toBeGreaterThan(0)
        for (const step of testSteps) {
            expect(step.run).not.toContain("playwright:install")
        }
    })
})

function runBash(script: string, env: Record<string, string>, cwd = process.cwd()): number {
    try {
        execFileSync("bash", ["-c", script], { env, cwd, stdio: "pipe" })
        return 0
    } catch (error) {
        return (error as { status: number }).status
    }
}

function runScope(eventName: string, changedFiles: string[]): Record<string, string> {
    const dir = mkdtempSync(join(tmpdir(), "ci-scope-"))
    const output = join(dir, "output")
    writeFileSync(output, "")
    writeFileSync(
        join(dir, "git"),
        `#!/bin/bash\nprintf '%s\\n' ${changedFiles.map((file) => `'${file}'`).join(" ")}\n`
    )
    chmodSync(join(dir, "git"), 0o755)
    const script = findStepRun(readWorkflow("ci.yml").jobs.scope, "Decide E2E scope")

    const status = runBash(script, {
        PATH: `${dir}:${process.env.PATH}`,
        EVENT_NAME: eventName,
        BASE_REF: "staging",
        GITHUB_OUTPUT: output
    })
    expect(status).toBe(0)

    return Object.fromEntries(
        readFileSync(output, "utf-8")
            .split("\n")
            .filter(Boolean)
            .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)])
    )
}

describe("ci.yml, job E2E scope", () => {
    it("gera 4 fatias no modo full, em push", () => {
        const outputs = runScope("push", [])

        expect(outputs.mode).toBe("full")
        expect(JSON.parse(outputs.matrix).include).toEqual([
            { index: 1, total: 4 },
            { index: 2, total: 4 },
            { index: 3, total: 4 },
            { index: 4, total: 4 }
        ])
    })

    it("gera 4 fatias no modo full, em PR que muda código fora do mapa", () => {
        const outputs = runScope("pull_request", ["src/utils/getAppVersion.ts"])

        expect(outputs.mode).toBe("full")
        expect(JSON.parse(outputs.matrix).include).toHaveLength(4)
    })

    it("gera uma só fatia 1/1 no modo changed", () => {
        const outputs = runScope("pull_request", ["e2e/about.spec.ts"])

        expect(outputs.mode).toBe("changed")
        expect(outputs.specs).toContain("e2e/about.spec.ts")
        expect(JSON.parse(outputs.matrix).include).toEqual([{ index: 1, total: 1 }])
    })

    it("devolve o modo none para PR só de documentação", () => {
        const outputs = runScope("pull_request", ["docs/setup/e2e-performance.md"])

        expect(outputs.mode).toBe("none")
    })

    it("expõe mode, specs e matrix como saídas do job", () => {
        const { scope } = readWorkflow("ci.yml").jobs

        expect(Object.keys(scope?.outputs ?? {}).toSorted()).toEqual(["matrix", "mode", "specs"])
    })
})

describe("ci.yml, job E2E shard", () => {
    const shard = readWorkflow("ci.yml").jobs["e2e-shard"]
    const steps = shard?.steps ?? []

    it("depende do escopo e não roda no modo none", () => {
        expect(shard?.needs).toBe("scope")
        expect(shard?.if).toContain("needs.scope.outputs.mode != 'none'")
    })

    it("usa matriz do escopo sem fail-fast", () => {
        expect(shard?.strategy?.["fail-fast"]).toBe(false)
        expect(shard?.strategy?.matrix).toContain("fromJSON(needs.scope.outputs.matrix)")
    })

    it("faz os dois builds em cada fatia", () => {
        expect(findStepRun(shard, "Build")).toBe("npm run build:fatec")
        expect(findStepRun(shard, "Build Pages artifact with the contact form enabled")).toBe(
            "npm run build:fatec:form"
        )
    })

    it("roda a fatia com --shard nos modos full e changed", () => {
        const full = steps.find((step) => step.name === "Run all end-to-end tests")
        const changed = steps.find(
            (step) => step.name === "Run end-to-end tests affected by the diff"
        )

        expect(full?.if).toBe("needs.scope.outputs.mode == 'full'")
        expect(full?.run).toContain("--shard=${{ matrix.index }}/${{ matrix.total }}")
        expect(changed?.if).toBe("needs.scope.outputs.mode == 'changed'")
        expect(changed?.run).toContain("--shard=${{ matrix.index }}/${{ matrix.total }}")
        expect(changed?.run).toContain("$SPECS")
    })

    it("sobe o blob da fatia mesmo com falha", () => {
        const upload = steps.find((step) => step.name === "Upload blob report")

        expect(upload?.if).toBe("${{ !cancelled() }}")
        expect(upload?.with?.name).toBe("blob-report-${{ matrix.index }}")
    })
})

describe("ci.yml, job E2E agregador", () => {
    const aggregator = readWorkflow("ci.yml").jobs.e2e
    const steps = aggregator?.steps ?? []
    const evaluate = findStepRun(aggregator, "Evaluate E2E result")

    function evaluateStatus(scopeResult: string, scopeMode: string, shardsResult: string) {
        return runBash(evaluate, {
            PATH: process.env.PATH ?? "",
            SCOPE_RESULT: scopeResult,
            SCOPE_MODE: scopeMode,
            SHARDS_RESULT: shardsResult
        })
    }

    it("roda sempre e depende do escopo e das fatias", () => {
        expect(aggregator?.if).toContain("always()")
        expect(aggregator?.needs).toEqual(expect.arrayContaining(["scope", "e2e-shard"]))
    })

    it("passa quando o escopo e as fatias dão sucesso", () => {
        expect(evaluateStatus("success", "full", "success")).toBe(0)
        expect(evaluateStatus("success", "changed", "success")).toBe(0)
    })

    it("passa no escopo none com as fatias puladas", () => {
        expect(evaluateStatus("success", "none", "skipped")).toBe(0)
    })

    it("falha quando uma fatia falha, é cancelada ou é pulada fora do none", () => {
        expect(evaluateStatus("success", "full", "failure")).not.toBe(0)
        expect(evaluateStatus("success", "full", "cancelled")).not.toBe(0)
        expect(evaluateStatus("success", "full", "skipped")).not.toBe(0)
    })

    it("falha quando o escopo não termina com sucesso", () => {
        expect(evaluateStatus("failure", "none", "skipped")).not.toBe(0)
        expect(evaluateStatus("cancelled", "full", "success")).not.toBe(0)
    })

    it("avisa dos testes flaky no resumo, só fora do escopo none e sem falhar o check", () => {
        const warn = steps.find((step) => step.name === "Warn about flaky tests")
        const merge = steps.find((step) => step.run?.includes("merge-reports"))

        expect(merge?.run).toContain("--reporter=html,json")
        expect(merge?.run).toContain("PLAYWRIGHT_JSON_OUTPUT_NAME=merged-report.json")

        expect(warn?.if).toContain("needs.scope.outputs.mode != 'none'")
        expect(warn?.if).toContain("needs.scope.result == 'success'")
        expect(warn?.run).toContain("npm run --silent e2e:flaky -- merged-report.json")
        expect(warn?.["continue-on-error"]).toBe(true)
        expect(warn?.run).toContain('>> "$GITHUB_STEP_SUMMARY"')
        expect(warn?.run).not.toContain("exit 1")
    })

    it("confere a união das fatias só no modo full", () => {
        const check = steps.find((step) => step.run === "npm run e2e:check-shards")

        expect(check?.if).toContain("needs.scope.outputs.mode == 'full'")
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
