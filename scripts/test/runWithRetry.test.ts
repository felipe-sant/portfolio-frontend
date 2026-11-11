import { describe, expect, it, vi } from "vitest"
import runWithRetry from "@scripts/runWithRetry"

describe("runWithRetry", () => {
    it("devolve 0 sem esperar quando a primeira tentativa tem sucesso", async () => {
        const execute = vi.fn().mockReturnValue(0)
        const wait = vi.fn().mockResolvedValue(undefined)
        const log = vi.fn()

        const code = await runWithRetry(execute, [30, 90], wait, log)

        expect(code).toBe(0)
        expect(execute).toHaveBeenCalledTimes(1)
        expect(wait).not.toHaveBeenCalled()
    })

    it("tenta de novo depois de 30 segundos quando a primeira falha e a segunda tem sucesso", async () => {
        const execute = vi.fn().mockReturnValueOnce(1).mockReturnValueOnce(0)
        const wait = vi.fn().mockResolvedValue(undefined)
        const log = vi.fn()

        const code = await runWithRetry(execute, [30, 90], wait, log)

        expect(code).toBe(0)
        expect(execute).toHaveBeenCalledTimes(2)
        expect(wait).toHaveBeenCalledTimes(1)
        expect(wait).toHaveBeenCalledWith(30)
    })

    it("devolve o código da última falha depois de três tentativas, esperando 30 e 90 segundos", async () => {
        const execute = vi.fn().mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValueOnce(3)
        const wait = vi.fn().mockResolvedValue(undefined)
        const log = vi.fn()

        const code = await runWithRetry(execute, [30, 90], wait, log)

        expect(code).toBe(3)
        expect(execute).toHaveBeenCalledTimes(3)
        expect(wait.mock.calls).toEqual([[30], [90]])
    })

    it("faz uma tentativa só quando não há esperas", async () => {
        const execute = vi.fn().mockReturnValue(5)
        const wait = vi.fn().mockResolvedValue(undefined)
        const log = vi.fn()

        const code = await runWithRetry(execute, [], wait, log)

        expect(code).toBe(5)
        expect(execute).toHaveBeenCalledTimes(1)
        expect(wait).not.toHaveBeenCalled()
    })

    it("registra no log cada tentativa e cada espera em português", async () => {
        const execute = vi.fn().mockReturnValue(1)
        const wait = vi.fn().mockResolvedValue(undefined)
        const log = vi.fn()

        await runWithRetry(execute, [30, 90], wait, log)

        const messages = log.mock.calls.map((call) => call[0])
        expect(messages).toEqual([
            "Tentativa 1 de 3.",
            "A tentativa 1 falhou com o código 1. Nova tentativa em 30 segundos.",
            "Tentativa 2 de 3.",
            "A tentativa 2 falhou com o código 1. Nova tentativa em 90 segundos.",
            "Tentativa 3 de 3.",
            "A tentativa 3 falhou com o código 1. Sem novas tentativas."
        ])
    })

    it("repete a tentativa interrompida por tempo e avisa no log", async () => {
        const execute = vi.fn().mockReturnValueOnce(124).mockReturnValueOnce(0)
        const wait = vi.fn().mockResolvedValue(undefined)
        const log = vi.fn()

        const code = await runWithRetry(execute, [30, 90], wait, log, 124)

        const messages = log.mock.calls.map((call) => call[0])
        expect(code).toBe(0)
        expect(execute).toHaveBeenCalledTimes(2)
        expect(wait.mock.calls).toEqual([[30]])
        expect(messages).toContain("A tentativa 1 excedeu o tempo limite e foi interrompida.")
    })

    it("devolve 124 quando todas as tentativas estouram o tempo", async () => {
        const execute = vi.fn().mockReturnValue(124)
        const wait = vi.fn().mockResolvedValue(undefined)
        const log = vi.fn()

        const code = await runWithRetry(execute, [30, 90], wait, log, 124)

        const messages = log.mock.calls.map((call) => call[0])
        expect(code).toBe(124)
        expect(execute).toHaveBeenCalledTimes(3)
        expect(messages.filter((message) => message.includes("excedeu o tempo limite"))).toHaveLength(3)
    })

    it("não fala em tempo limite quando o código é 124 e nenhum código de tempo foi informado", async () => {
        const execute = vi.fn().mockReturnValue(124)
        const log = vi.fn()

        await runWithRetry(execute, [], vi.fn().mockResolvedValue(undefined), log)

        expect(log.mock.calls.map((call) => call[0])).toEqual([
            "Tentativa 1 de 1.",
            "A tentativa 1 falhou com o código 124. Sem novas tentativas."
        ])
    })

    it("aceita um execute assíncrono", async () => {
        const execute = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(0)
        const wait = vi.fn().mockResolvedValue(undefined)
        const log = vi.fn()

        const code = await runWithRetry(execute, [30, 90], wait, log)

        expect(code).toBe(0)
        expect(execute).toHaveBeenCalledTimes(2)
    })
})
