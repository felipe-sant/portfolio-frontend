import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import decideBashCommand from "@scripts/claudeHooks/decideBashCommand"
import parseHookInput from "@scripts/claudeHooks/parseHookInput"

const BLOCK_EXIT_CODE = 2

function main() {
    const input = parseHookInput(readFileSync(0, "utf8"))
    if (!input || input.toolName !== "Bash") {
        console.error(
            "guardBash: entrada do hook inválida ou de outra ferramenta, nada a bloquear."
        )
        return 0
    }
    const baseDirectory = input.cwd ?? process.cwd()

    function readBranch(directory?: string) {
        try {
            return execFileSync(
                "git",
                ["-C", directory ?? baseDirectory, "branch", "--show-current"],
                {
                    encoding: "utf8",
                    stdio: ["ignore", "pipe", "pipe"]
                }
            ).trim()
        } catch {
            console.error("guardBash: não foi possível ler a branch atual, seguindo sem bloquear.")
            return ""
        }
    }

    const decision = decideBashCommand(input.command, readBranch, baseDirectory)
    if (decision.blocked) {
        console.error(decision.message)
        return BLOCK_EXIT_CODE
    }
    return 0
}

try {
    process.exitCode = main()
} catch (error) {
    console.error(`guardBash: falha inesperada, seguindo sem bloquear. ${String(error)}`)
    process.exitCode = 0
}
