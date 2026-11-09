import { readFileSync } from "node:fs"
import { parse } from "yaml"
import { describe, expect, it } from "vitest"

type Step = {
    name?: string
    id?: string
    run?: string
    if?: string
    env?: Record<string, string>
}

type Workflow = {
    on: {
        push?: { branches?: string[] }
        workflow_dispatch?: unknown
    }
    permissions: Record<string, string>
    concurrency: { group: string; "cancel-in-progress": boolean }
    jobs: Record<string, { steps: Step[] }>
}

const TITLE = "Chore :see_no_evil: Promove staging para produção"

const workflow = parse(readFileSync(".github/workflows/promote.yml", "utf-8")) as Workflow
const steps = Object.values(workflow.jobs).flatMap((job) => job.steps)
const runSteps = steps.filter((step) => step.run !== undefined)
const scripts = runSteps.map((step) => step.run ?? "")

function findStep(fragment: string) {
    return runSteps.filter((step) => step.run?.includes(fragment))
}

describe("promote.yml", () => {
    it("dispara em push na staging e em workflow_dispatch", () => {
        expect(workflow.on.push?.branches).toEqual(["staging"])
        expect("workflow_dispatch" in workflow.on).toBe(true)
    })

    it("pede só contents read e pull-requests write", () => {
        expect(workflow.permissions).toEqual({
            contents: "read",
            "pull-requests": "write"
        })
    })

    it("não cancela a execução em andamento", () => {
        expect(workflow.concurrency["cancel-in-progress"]).toBe(false)
    })

    it("não interpola expressões direto em blocos run", () => {
        scripts.forEach((script) => {
            expect(script).not.toContain("${{")
        })
    })

    it("nunca faz merge, auto-merge nem aprovação", () => {
        scripts.forEach((script) => {
            expect(script).not.toMatch(/merge|--auto|approve/)
        })
    })

    it("cria o PR uma vez, só sem PR aberto, e edita uma vez", () => {
        const create = findStep("gh pr create")
        const edit = findStep("gh pr edit")

        expect(create).toHaveLength(1)
        expect(edit).toHaveLength(1)
        expect(create[0]?.if).toContain("steps.existing.outputs.number == ''")
        expect(edit[0]?.if).toContain("steps.existing.outputs.number != ''")
    })

    it("usa o título padrão ao criar e ao editar", () => {
        const create = findStep("gh pr create")[0]
        const edit = findStep("gh pr edit")[0]

        expect(create?.env?.TITLE).toBe(TITLE)
        expect(edit?.env?.TITLE).toBe(TITLE)
        expect(create?.run).toContain('--title "$TITLE"')
        expect(edit?.run).toContain('--title "$TITLE"')
    })

    it("só cria e edita quando o preparo manda promover", () => {
        expect(findStep("gh pr create")[0]?.if).toContain("steps.prepare.outputs.promote == 'true'")
        expect(findStep("gh pr edit")[0]?.if).toContain("steps.prepare.outputs.promote == 'true'")
    })

    it("bloqueia só com versão pendente, convertendo em draft sem criar PR", () => {
        const block = findStep("--undo")

        expect(block).toHaveLength(1)
        expect(block[0]?.if).toContain("steps.prepare.outputs.reason == 'pending-version'")
        expect(block[0]?.run).toContain("gh pr ready")
        expect(block[0]?.run).not.toContain("gh pr create")
    })

    it("define o assignee por env e não usa label", () => {
        const create = findStep("gh pr create")[0]

        expect(create?.run).toContain('--assignee "$OWNER"')
        expect(create?.env?.OWNER).toBe("${{ github.repository_owner }}")
        scripts.forEach((script) => {
            expect(script).not.toContain("--label")
        })
    })

    it("tira o PR de draft antes de editar o corpo", () => {
        const script = findStep("gh pr edit")[0]?.run ?? ""

        expect(script.indexOf("gh pr ready")).toBeGreaterThanOrEqual(0)
        expect(script.indexOf("gh pr ready")).toBeLessThan(script.indexOf("gh pr edit"))
    })
})
