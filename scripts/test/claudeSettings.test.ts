import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type HookEntry = { matcher?: string; hooks: { type: string; command: string }[] }

const settings: { hooks: Record<string, HookEntry[]> } = JSON.parse(
    readFileSync(".claude/settings.json", "utf8")
)

function commandsOf(event: string, matcher: string) {
    return settings.hooks[event]
        .filter((entry) => entry.matcher === matcher)
        .flatMap((entry) => entry.hooks.map((hook) => hook.command))
}

function referencedScripts(command: string) {
    return [...command.matchAll(/\.claude\/hooks\/[A-Za-z]+\.ts/g)].map((match) => match[0])
}

describe(".claude/settings.json", () => {
    it("liga guardBash.ts ao PreToolUse de Bash", () => {
        const commands = commandsOf("PreToolUse", "Bash")
        expect(commands).toHaveLength(1)
        const [script] = referencedScripts(commands[0])
        expect(script).toBe(".claude/hooks/guardBash.ts")
        expect(existsSync(script)).toBe(true)
    })

    it("liga formatFile.ts ao PostToolUse de Edit, Write e MultiEdit", () => {
        const commands = commandsOf("PostToolUse", "Edit|Write|MultiEdit")
        expect(commands).toHaveLength(1)
        const [script] = referencedScripts(commands[0])
        expect(script).toBe(".claude/hooks/formatFile.ts")
        expect(existsSync(script)).toBe(true)
    })

    it("referencia só scripts que existem e usa CLAUDE_PROJECT_DIR", () => {
        const commands = Object.values(settings.hooks).flatMap((entries) =>
            entries.flatMap((entry) => entry.hooks.map((hook) => hook.command))
        )
        for (const command of commands) {
            expect(command).toContain("$CLAUDE_PROJECT_DIR")
            for (const script of referencedScripts(command)) {
                expect(existsSync(script)).toBe(true)
            }
        }
    })

    it("não roda teste automatizado em nenhum hook", () => {
        const raw = JSON.stringify(settings.hooks)
        expect(raw).not.toMatch(/vitest|npm test|npm run test|playwright/)
    })

    it("não tem comentário em nenhum script de .claude/hooks", () => {
        for (const name of readdirSync(".claude/hooks")) {
            const content = readFileSync(`.claude/hooks/${name}`, "utf8")
            expect(content).not.toMatch(/\/\/|\/\*/)
        }
    })

    it("não está no .gitignore", () => {
        const ignored = (() => {
            try {
                execFileSync("git", ["check-ignore", "-q", ".claude/settings.json"])
                return true
            } catch {
                return false
            }
        })()
        expect(ignored).toBe(false)
    })
})
