import { execFileSync } from "node:child_process"
import { appendFileSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import buildPromotionBody from "@scripts/buildPromotionBody"
import hasPendingChangesets from "@scripts/hasPendingChangesets"
import parseMergedPullNumbers from "@scripts/parseMergedPullNumbers"

type PullView = {
    number: number
    title: string
    closingIssuesReferences: { number: number }[]
}

function run(command: string, args: string[]) {
    return execFileSync(command, args, { encoding: "utf-8" })
}

function viewPull(number: number) {
    try {
        return JSON.parse(
            run("gh", [
                "pr",
                "view",
                String(number),
                "--json",
                "number,title,closingIssuesReferences"
            ])
        ) as PullView
    } catch (error) {
        const stderr = error instanceof Error && "stderr" in error ? String(error.stderr) : ""

        if (stderr.includes("Could not resolve to a PullRequest")) {
            return undefined
        }

        throw error
    }
}

function readChangesets() {
    return readdirSync(".changeset", { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => ({
            name: entry.name,
            content: readFileSync(join(".changeset", entry.name), "utf-8")
        }))
}

function emit(outputs: Record<string, string>) {
    const lines = Object.entries(outputs).map(([key, value]) => `${key}=${value}\n`)

    if (process.env.GITHUB_OUTPUT) {
        appendFileSync(process.env.GITHUB_OUTPUT, lines.join(""))
    } else {
        process.stdout.write(lines.join(""))
    }
}

function writeSummary(text: string) {
    if (process.env.GITHUB_STEP_SUMMARY) {
        appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`)
    } else {
        process.stdout.write(`${text}\n`)
    }
}

const ahead = Number(run("git", ["rev-list", "--count", "origin/main..origin/staging"]).trim())

if (ahead === 0) {
    writeSummary("Nada a promover: a main já contém todos os commits da staging.")
    emit({ promote: "false", reason: "no-diff" })
} else if (hasPendingChangesets(readChangesets())) {
    writeSummary("Promoção bloqueada: há changeset pendente; mergeie o PR de versão.")
    emit({ promote: "false", reason: "pending-version" })
} else {
    const subjects = run("git", ["log", "--format=%s", "origin/main..origin/staging"])
        .split("\n")
        .filter((subject) => subject !== "")
    const pulls = parseMergedPullNumbers(subjects).flatMap((number) => {
        const view = viewPull(number)

        return view
            ? [
                  {
                      number: view.number,
                      title: view.title,
                      issues: view.closingIssuesReferences.map((issue) => issue.number)
                  }
              ]
            : []
    })
    const bodyFile = join(
        mkdtempSync(join(process.env.RUNNER_TEMP ?? tmpdir(), "promotion-")),
        "body.md"
    )

    writeFileSync(bodyFile, buildPromotionBody({ pulls }))
    emit({ promote: "true", "body-file": bodyFile })
}
