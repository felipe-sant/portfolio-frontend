import { describe, expect, it } from "vitest"
import parseHookInput from "@scripts/claudeHooks/parseHookInput"

describe("parseHookInput", () => {
    it.each(["", "   ", "{nope", "null", "42", '"texto"', "{}", '{"tool_name":"Bash"}'])(
        "devolve entrada nula para %j sem lançar",
        (raw) => {
            expect(parseHookInput(raw)).toBeNull()
        }
    )

    it("devolve command e cwd de uma chamada Bash", () => {
        const raw = JSON.stringify({
            tool_name: "Bash",
            cwd: "/repo",
            tool_input: { command: "git status" }
        })
        expect(parseHookInput(raw)).toEqual({
            toolName: "Bash",
            command: "git status",
            cwd: "/repo",
            filePath: undefined
        })
    })

    it.each(["Edit", "Write", "MultiEdit"])("devolve file_path de %s", (toolName) => {
        const raw = JSON.stringify({
            tool_name: toolName,
            tool_input: { file_path: "/repo/src/a.ts" }
        })
        expect(parseHookInput(raw)?.filePath).toBe("/repo/src/a.ts")
    })

    it("ignora campos de tipo errado", () => {
        const raw = JSON.stringify({
            tool_name: "Bash",
            cwd: 1,
            tool_input: { command: 2, file_path: 3 }
        })
        expect(parseHookInput(raw)).toEqual({
            toolName: "Bash",
            command: undefined,
            cwd: undefined,
            filePath: undefined
        })
    })
})
