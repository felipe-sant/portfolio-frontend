import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import parseHookInput from "@scripts/claudeHooks/parseHookInput"
import planFileChecks from "@scripts/claudeHooks/planFileChecks"

const BLOCK_EXIT_CODE = 2

function readFailureOutput(error: unknown) {
    if (error instanceof Error) {
        const output = error as Error & { stdout?: string; stderr?: string }
        return `${output.stdout ?? ""}${output.stderr ?? ""}`.trim() || error.message
    }
    return String(error)
}

function main() {
    const input = parseHookInput(readFileSync(0, "utf8"))
    if (!input) {
        console.error("formatFile: entrada do hook inválida, nada a formatar.")
        return 0
    }
    const projectDirectory = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
    let exitCode = 0

    for (const step of planFileChecks(input.filePath, existsSync)) {
        try {
            execFileSync("npx", [step.command, ...step.args], {
                cwd: projectDirectory,
                encoding: "utf8",
                stdio: ["ignore", "pipe", "pipe"]
            })
        } catch (error) {
            console.error(`${step.command} acusou problema em ${input.filePath}:`)
            console.error(readFailureOutput(error))
            if (step.command === "oxlint") {
                exitCode = BLOCK_EXIT_CODE
            }
        }
    }
    return exitCode
}

try {
    process.exitCode = main()
} catch (error) {
    console.error(`formatFile: falha inesperada. ${String(error)}`)
    process.exitCode = 0
}
