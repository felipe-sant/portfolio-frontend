import { spawnSync } from "node:child_process"
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const ROOT = resolve(".")
const TSX = join(ROOT, "node_modules/.bin/tsx")
const TSCONFIG = join(ROOT, "tsconfig.node.json")
const SCRIPT = join(ROOT, "scripts/preparePromotion.ts")

const PULL_VIEWS: Record<string, unknown> = {
    "7": { number: 7, title: "Feat sete", closingIssuesReferences: [{ number: 3 }] },
    "9": { number: 9, title: "Chore nove", closingIssuesReferences: [] }
}

type Scenario = {
    stagingSubjects: string[]
    changesetFiles: string[]
}

type Result = {
    outputs: Record<string, string>
    summary: string
    body: string | undefined
    status: number | null
}

const directories: string[] = []

function git(cwd: string, args: string[]) {
    const result = spawnSync("git", args, { cwd, encoding: "utf-8" })
    if (result.status !== 0) {
        throw new Error(result.stderr)
    }
    return result.stdout.trim()
}

function createRepository({ stagingSubjects, changesetFiles }: Scenario) {
    const directory = mkdtempSync(join(tmpdir(), "promotion-test-"))
    directories.push(directory)

    git(directory, ["init", "-q", "-b", "main"])
    git(directory, ["config", "user.email", "test@example.com"])
    git(directory, ["config", "user.name", "Test"])
    git(directory, ["config", "commit.gpgsign", "false"])
    git(directory, ["commit", "-q", "--allow-empty", "-m", "base"])
    git(directory, ["update-ref", "refs/remotes/origin/main", "HEAD"])

    stagingSubjects.forEach((subject) => {
        git(directory, ["commit", "-q", "--allow-empty", "-m", subject])
    })
    git(directory, ["update-ref", "refs/remotes/origin/staging", "HEAD"])

    mkdirSync(join(directory, ".changeset"))
    changesetFiles.forEach((name) => {
        writeFileSync(join(directory, ".changeset", name), "")
    })

    const binDirectory = join(directory, "fake-bin")
    mkdirSync(binDirectory)
    const gh = join(binDirectory, "gh")
    writeFileSync(
        gh,
        `#!/bin/sh\ncase "$3" in\n${Object.entries(PULL_VIEWS)
            .map(([number, view]) => `  ${number}) echo '${JSON.stringify(view)}';;`)
            .join("\n")}\n  *) echo "pr desconhecido" >&2; exit 1;;\nesac\n`
    )
    chmodSync(gh, 0o755)

    return { directory, binDirectory }
}

function runPrepare(scenario: Scenario): Result {
    const { directory, binDirectory } = createRepository(scenario)
    const outputFile = join(directory, "github-output.txt")
    const summaryFile = join(directory, "github-summary.txt")
    writeFileSync(outputFile, "")
    writeFileSync(summaryFile, "")

    const result = spawnSync(TSX, ["--tsconfig", TSCONFIG, SCRIPT], {
        cwd: directory,
        encoding: "utf-8",
        env: {
            ...process.env,
            PATH: `${binDirectory}:${process.env.PATH}`,
            GITHUB_OUTPUT: outputFile,
            GITHUB_STEP_SUMMARY: summaryFile,
            RUNNER_TEMP: directory
        }
    })

    const outputs = Object.fromEntries(
        readFileSync(outputFile, "utf-8")
            .split("\n")
            .filter((line) => line !== "")
            .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)])
    )

    return {
        outputs,
        summary: readFileSync(summaryFile, "utf-8"),
        body: outputs["body-file"] ? readFileSync(outputs["body-file"], "utf-8") : undefined,
        status: result.status
    }
}

afterEach(() => {
    directories.splice(0).forEach((directory) => {
        rmSync(directory, { recursive: true, force: true })
    })
})

describe("preparePromotion", () => {
    it("não promove quando a main já contém a staging", () => {
        const result = runPrepare({ stagingSubjects: [], changesetFiles: [] })

        expect(result.status).toBe(0)
        expect(result.outputs).toEqual({ promote: "false", reason: "no-diff" })
        expect(result.summary).toContain("Nada a promover")
    })

    it("bloqueia com changeset pendente, mesmo com a staging à frente", () => {
        const result = runPrepare({
            stagingSubjects: ["Merge pull request #7 from a/b"],
            changesetFiles: ["README.md", "cool-cats-jump.md"]
        })

        expect(result.status).toBe(0)
        expect(result.outputs).toEqual({ promote: "false", reason: "pending-version" })
        expect(result.summary).toContain("Promoção bloqueada")
    })

    it("não bloqueia quando só há README.md e config.json em .changeset", () => {
        const result = runPrepare({
            stagingSubjects: ["Merge pull request #7 from a/b"],
            changesetFiles: ["README.md", "config.json"]
        })

        expect(result.outputs.promote).toBe("true")
    })

    it("gera o corpo com issues e PRs sem issue lidos dos commits", () => {
        const result = runPrepare({
            stagingSubjects: [
                "Merge pull request #7 from a/b",
                "Chore :see_no_evil: Versão (#9)",
                "Fix sem número de PR"
            ],
            changesetFiles: ["README.md"]
        })

        expect(result.status).toBe(0)
        expect(result.outputs.promote).toBe("true")
        expect(result.body).toContain("- #3 (PR #7)")
        expect(result.body).toContain("- PR #9: Chore nove")
        expect(result.body).not.toContain("sem número")
    })
})
