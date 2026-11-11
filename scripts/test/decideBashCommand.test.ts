import { describe, expect, it } from "vitest"
import decideBashCommand from "@scripts/claudeHooks/decideBashCommand"

function decide(
    command: unknown,
    branch = "feat/x",
    branches: Record<string, string> = {},
    cwd?: string
) {
    return decideBashCommand(
        command,
        (directory) =>
            directory !== undefined && directory in branches ? branches[directory] : branch,
        cwd
    )
}

describe("decideBashCommand", () => {
    describe("entrada inválida", () => {
        it("não bloqueia comando vazio", () => {
            expect(decide("", "staging").blocked).toBe(false)
        })

        it("não bloqueia entrada que não é texto", () => {
            expect(decide(undefined, "staging").blocked).toBe(false)
            expect(decide(42, "staging").blocked).toBe(false)
        })
    })

    describe("git commit", () => {
        it("bloqueia em staging com mensagem em português", () => {
            const decision = decide("git commit -m x", "staging")
            expect(decision.blocked).toBe(true)
            expect(decision.message).toContain("staging")
        })

        it("bloqueia em main", () => {
            expect(decide("git commit -m x", "main").blocked).toBe(true)
        })

        it("permite em branch de trabalho", () => {
            expect(decide("git commit -m x", "feat/x").blocked).toBe(false)
        })

        it("permite com HEAD desanexado (branch vazia)", () => {
            expect(decide("git commit -m x", "").blocked).toBe(false)
        })

        it("lê a branch do diretório de git -C", () => {
            const branches = { "/repo/main-copy": "main", "/repo/work": "feat/x" }
            expect(decide("git -C /repo/main-copy commit -m x", "feat/x", branches).blocked).toBe(
                true
            )
            expect(decide("git -C /repo/work commit -m x", "main", branches).blocked).toBe(false)
        })

        it("resolve git -C relativo contra o cwd do hook", () => {
            const branches = { "/repo/main-copy": "main", "/repo/work": "feat/x" }
            expect(
                decide("git -C ../main-copy commit -m x", "feat/x", branches, "/repo/work").blocked
            ).toBe(true)
            expect(
                decide("git -C ../work commit -m x", "main", branches, "/repo/main-copy").blocked
            ).toBe(false)
        })

        it("bloqueia git -c k=v commit em staging", () => {
            expect(decide("git -c core.editor=vim commit -m x", "staging").blocked).toBe(true)
        })

        it("bloqueia commit com substituição de comando na mensagem em staging", () => {
            expect(decide('git commit -m "$(date)"', "staging").blocked).toBe(true)
        })

        it("não bloqueia commit com substituição de comando em branch de trabalho", () => {
            expect(decide('git commit -m "$(cat msg.txt)"', "feat/x").blocked).toBe(false)
        })

        it("bloqueia commit dentro de comando composto", () => {
            expect(decide("cd x && git commit -m y", "staging").blocked).toBe(true)
        })

        it("não bloqueia texto de mensagem que cita git push main", () => {
            expect(decide('git commit -m "git push main"', "feat/x").blocked).toBe(false)
        })
    })

    describe("git push", () => {
        it.each([
            "git push origin HEAD:main",
            "git push origin main",
            "git push origin feat/x:staging",
            "git push origin HEAD:refs/heads/main",
            "git push origin refs/heads/staging"
        ])("bloqueia %s", (command) => {
            expect(decide(command, "feat/x").blocked).toBe(true)
        })

        it.each([
            "env VAR=x git push origin main",
            "sudo git push origin main",
            "git push --delete origin main",
            "git push origin :main",
            "git push origin +main"
        ])("bloqueia %s", (command) => {
            expect(decide(command, "feat/x").blocked).toBe(true)
        })

        it("permite push de branch de trabalho", () => {
            expect(decide("git push origin feat/x").blocked).toBe(false)
            expect(decide("git push -u origin feat/x").blocked).toBe(false)
        })

        it("bloqueia push quando a branch atual é de ambiente", () => {
            expect(decide("git push", "staging").blocked).toBe(true)
        })

        it("com HEAD desanexado bloqueia só destino de ambiente", () => {
            expect(decide("git push origin HEAD:feat/x", "").blocked).toBe(false)
            expect(decide("git push origin HEAD:main", "").blocked).toBe(true)
        })

        it("bloqueia push em comando composto", () => {
            expect(decide("cd x && git push origin main").blocked).toBe(true)
        })

        it("não bloqueia texto citado de outro comando", () => {
            expect(decide('echo "git push origin main"').blocked).toBe(false)
        })
    })

    describe("git push forçado", () => {
        it.each([
            "git push --force",
            "git push -f",
            "git push -fu origin feat/x",
            "git push origin feat/x --force",
            "git push origin feat/x -f"
        ])("bloqueia %s em branch de trabalho", (command) => {
            const decision = decide(command, "feat/x")
            expect(decision.blocked).toBe(true)
            expect(decision.message).toContain("force")
        })

        it.each([
            "git push --force-with-lease",
            "git push --force-with-lease=feat/x origin feat/x"
        ])("permite %s em branch de trabalho", (command) => {
            expect(decide(command, "feat/x").blocked).toBe(false)
        })

        it("não bloqueia --force dentro de mensagem entre aspas", () => {
            expect(decide('git commit -m "usa --force no push"', "feat/x").blocked).toBe(false)
        })
    })

    describe("rm recursivo", () => {
        it.each([
            'rm -rf "meu dir/x"',
            "rm -fr a",
            "rm -R a",
            "rm -Rf a",
            "rm -r a",
            "rm --recursive a",
            "cd x; rm -rf a"
        ])("bloqueia %s", (command) => {
            const decision = decide(command)
            expect(decision.blocked).toBe(true)
            expect(decision.message).toContain("rm")
        })

        it("não trata o que vem depois de -- como flag", () => {
            expect(decide("rm -- -r").blocked).toBe(false)
        })

        it.each(["rm a.txt", "rm -f a.txt", 'rm "meu arquivo.txt"'])("permite %s", (command) => {
            expect(decide(command).blocked).toBe(false)
        })
    })
})
