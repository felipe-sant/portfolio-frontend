import { readFileSync } from "node:fs"
import { parse } from "yaml"
import { describe, expect, it } from "vitest"

type Step = {
    name?: string
    id?: string
    if?: string
    uses?: string
    run?: string
    env?: Record<string, string>
    with?: Record<string, string | number | boolean>
}

type Job = {
    name?: string
    if?: string
    needs?: string
    uses?: string
    permissions?: Record<string, string>
    outputs?: Record<string, string>
    with?: Record<string, string>
    secrets?: Record<string, string>
    steps?: Step[]
}

type Workflow = {
    on: {
        push?: { branches?: string[] }
        pull_request?: { branches?: string[] }
        workflow_dispatch?: unknown
    }
    permissions: Record<string, string>
    concurrency: { group: string; "cancel-in-progress": boolean }
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

function findStep(job: Job, predicate: (step: Step) => boolean): Step {
    const step = (job.steps ?? []).find(predicate)
    if (!step) throw new Error("Passo não encontrado no workflow")
    return step
}

describe("version.yml", () => {
    const workflow = readWorkflow("version.yml")
    const title = "Chore :see_no_evil: Atualiza versão e CHANGELOG"
    const job = workflow.jobs.version
    const action = findStep(job, (step) => step.uses === "changesets/action@v2")

    it("roda em push na staging e por workflow_dispatch, sem pull_request", () => {
        expect(workflow.on.push?.branches).toEqual(["staging"])
        expect(Object.keys(workflow.on)).toContain("workflow_dispatch")
        expect(workflow.on.pull_request).toBeUndefined()
    })

    it("usa a changesets/action v2 com o script de versão e o título e o commit padronizados", () => {
        expect(action.with?.["version-script"]).toBe("npm run changeset:version")
        expect(action.with?.["commit-message"]).toBe(title)
        expect(action.with?.["pr-title"]).toBe(title)
    })

    it("tem as permissões mínimas, serializa sem cancelar e faz checkout completo", () => {
        expect(workflow.permissions).toEqual({ contents: "write", "pull-requests": "write" })
        expect(workflow.concurrency["cancel-in-progress"]).toBe(false)
        expect(workflow.concurrency.group).toContain("version-")
        const checkout = findStep(
            job,
            (step) => step.uses?.startsWith("actions/checkout@") ?? false
        )
        expect(checkout.with?.["fetch-depth"]).toBe(0)
        expect(action.with?.["github-token"]).toBe("${{ secrets.GITHUB_TOKEN }}")
    })

    it("não interpola expressões direto em blocos run", () => {
        runScripts(workflow).forEach((script) => {
            expect(script).not.toContain("${{")
        })
    })
})

describe("changeset-check.yml", () => {
    const workflow = readWorkflow("changeset-check.yml")
    const job = workflow.jobs.changeset

    it("roda em pull_request para a staging e ignora o PR de versão e o de retorno da main", () => {
        expect(workflow.on.pull_request?.branches).toEqual(["staging"])
        expect(job.if).toContain("github.head_ref != 'changeset-release/staging'")
        expect(job.if).toContain("github.head_ref != 'main'")
    })

    it("checa o changeset contra origin/staging com o histórico completo", () => {
        expect(runScripts(workflow)).toContain("npx changeset status --since=origin/staging")
        const checkout = findStep(
            job,
            (step) => step.uses?.startsWith("actions/checkout@") ?? false
        )
        expect(checkout.with?.["fetch-depth"]).toBe(0)
    })

    it("tem permissão só de leitura e cancela apenas execuções de PR", () => {
        expect(workflow.permissions).toEqual({ contents: "read" })
        expect(workflow.concurrency["cancel-in-progress"]).toBe(true)
    })
})

describe("release.yml", () => {
    const workflow = readWorkflow("release.yml")
    const releaseJob = workflow.jobs.release
    const publishJob = workflow.jobs["publish-fatec"]

    it("roda só em push na main, sem workflow_dispatch", () => {
        expect(workflow.on.push?.branches).toEqual(["main"])
        expect(Object.keys(workflow.on)).not.toContain("workflow_dispatch")
        expect(workflow.on.pull_request).toBeUndefined()
    })

    it("prepara o release com histórico e tags e cria o Release só quando a saída é true", () => {
        const checkout = findStep(
            releaseJob,
            (step) => step.uses?.startsWith("actions/checkout@") ?? false
        )
        expect(checkout.with?.["fetch-depth"]).toBe(0)
        expect(checkout.with?.["fetch-tags"]).toBe(true)
        const prepare = findStep(releaseJob, (step) => step.id === "prepare")
        expect(prepare.run).toContain("scripts/prepareRelease.ts")
        const create = findStep(
            releaseJob,
            (step) => step.run?.includes("gh release create") ?? false
        )
        expect(create.if).toBe("steps.prepare.outputs.release == 'true'")
        expect(create.env?.GH_TOKEN).toBe("${{ github.token }}")
        expect(create.env?.TARGET_SHA).toBe("${{ github.sha }}")
        expect(create.run).toContain('--target "$TARGET_SHA"')
        expect(create.run).toContain('--notes-file "$NOTES_FILE"')
    })

    it("só cria tag e Release no passo condicional", () => {
        const scripts = runScripts(workflow)
        const creators = scripts.filter((script) =>
            /gh release create|git tag|git push/.test(script)
        )
        expect(creators).toHaveLength(1)
        expect(creators[0]).toContain("gh release create")
        scripts.forEach((script) => {
            expect(script).not.toContain("${{")
        })
    })

    it("publica na Fatec só para a saída publish-fatec, com a tag e o token", () => {
        expect(publishJob.needs).toBe("release")
        expect(publishJob.if).toBe("needs.release.outputs.publish-fatec == 'true'")
        expect(publishJob.uses).toBe("./.github/workflows/fatec-pages.yml")
        expect(publishJob.with?.tag).toBe("${{ needs.release.outputs.tag }}")
        expect(publishJob.secrets?.FATEC_PAGES_TOKEN).toBe("${{ secrets.FATEC_PAGES_TOKEN }}")
    })

    it("dá contents write ao release, read ao chamador da Fatec e não cancela execuções", () => {
        expect(releaseJob.permissions).toEqual({ contents: "write" })
        expect(publishJob.permissions).toEqual({ contents: "read" })
        expect(workflow.concurrency["cancel-in-progress"]).toBe(false)
    })
})
