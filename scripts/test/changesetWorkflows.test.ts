import { readFileSync } from "node:fs"
import { parse } from "yaml"
import { describe, expect, it } from "vitest"

type Step = {
    id?: string
    uses?: string
    run?: string
    if?: string
    env?: Record<string, string>
}

type Job = {
    if?: string
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

    describe("passo que troca o texto padrão do PR de versão", () => {
        const steps = readWorkflow("version.yml").jobs.version?.steps ?? []
        const actionIndex = steps.findIndex((step) => step.uses?.startsWith("changesets/action"))
        const replaceIndex = steps.findIndex((step) => step.run?.includes("prepareVersionPrBody"))

        it("roda depois da action e só quando ela devolve pr-number", () => {
            const action = steps[actionIndex]
            const replace = steps[replaceIndex]

            expect(action?.id).toBeDefined()
            expect(replaceIndex).toBeGreaterThan(actionIndex)
            expect(replace?.if).toBe(`steps.${action?.id}.outputs.pr-number != ''`)
            expect(replace?.env?.NUMBER).toBe(`\${{ steps.${action?.id}.outputs.pr-number }}`)
        })

        it("só chama gh pr edit com body-file quando o corpo mudou", () => {
            const script = steps[replaceIndex]?.run ?? ""

            expect(script).toMatch(/if \[ "\$changed" = "true" \]/)
            expect(script.indexOf("gh pr edit")).toBeGreaterThan(script.indexOf("$changed"))
            expect(script).toContain("--body-file")
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

describe(".changeset/config.json", () => {
    it("gera o CHANGELOG com link de PR e commit pelo repositório do GitHub", () => {
        const config = JSON.parse(readFileSync(".changeset/config.json", "utf-8")) as {
            changelog: unknown
        }

        expect(config.changelog).toEqual([
            "@changesets/changelog-github",
            { repo: "felipe-sant/portfolio-frontend" }
        ])
    })
})

describe("changeset-check.yml", () => {
    it("ignora o PR de versão e o PR com head na main", () => {
        const condition = readWorkflow("changeset-check.yml").jobs.changeset?.if

        expect(condition).toContain("github.head_ref != 'changeset-release/staging'")
        expect(condition).toContain("github.head_ref != 'main'")
    })
})

describe("release.yml, condições", () => {
    const workflow = readWorkflow("release.yml")

    it("só cria o Release quando o passo de preparo manda", () => {
        const create = workflow.jobs.release?.steps?.find((step) =>
            step.run?.includes("gh release create")
        )

        expect(create?.if).toBe("steps.prepare.outputs.release == 'true'")
    })

    it("só publica na Fatec quando a saída publish-fatec é true", () => {
        expect(workflow.jobs["publish-fatec"]?.if).toBe(
            "needs.release.outputs.publish-fatec == 'true'"
        )
    })
})
