import type { ReactNode } from "react"
import { Provider } from "react-redux"
import { afterEach, describe, expect, it, vi } from "vitest"
import { configureStore } from "@reduxjs/toolkit"
import type { Middleware } from "@reduxjs/toolkit"
import { act, renderHook } from "@testing-library/react"
import useContactForm from "@/pages/hooks/useContactForm"
import simulateContactSend from "@/services/content/simulateContactSend"
import api from "@/store/api"
import rootReducer from "@/store/rootReducer"

vi.mock("@/services/content/simulateContactSend", () => ({
    default: vi.fn(() => Promise.resolve())
}))

const VALID_MESSAGE = "Preciso de um site para a minha loja."

function attach(ref: { current: HTMLElement | null }, spy: () => void) {
    const element = document.createElement("div")
    element.focus = spy
    ref.current = element
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

function renderForm() {
    const actions: unknown[] = []
    const recordActions: Middleware = () => (next) => (action) => {
        actions.push(action)
        return next(action)
    }
    const store = configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(api.middleware, recordActions)
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    )
    const view = renderHook(() => useContactForm(), { wrapper })
    const focus = {
        name: vi.fn(),
        email: vi.fn(),
        message: vi.fn(),
        submit: vi.fn(),
        sentHeading: vi.fn()
    }

    attach(view.result.current.nameRef, focus.name)
    attach(view.result.current.emailRef, focus.email)
    attach(view.result.current.messageRef, focus.message)
    attach(view.result.current.submitRef, focus.submit)
    attach(view.result.current.sentHeadingRef, focus.sentHeading)

    return { ...view, focus, actions }
}

type Form = ReturnType<typeof renderForm>

function fillValid(form: Form) {
    act(() => {
        form.result.current.setField("name", "Ana")
        form.result.current.setField("email", "ana@example.com")
        form.result.current.setField("message", VALID_MESSAGE)
    })
}

async function submit(form: Form) {
    await act(async () => {
        await form.result.current.submit()
    })
}

afterEach(() => {
    vi.mocked(simulateContactSend).mockReset()
    vi.mocked(simulateContactSend).mockResolvedValue(undefined)
})

describe("useContactForm", () => {
    it("não produz erro ao digitar antes do primeiro envio", () => {
        const form = renderForm()

        act(() => form.result.current.setField("email", "a@"))

        expect(form.result.current.errors).toEqual({})
        expect(form.result.current.summaryCount).toBe(0)
    })

    it("no envio vazio mostra os três erros, conta 3 e foca o Nome", async () => {
        const form = renderForm()

        await submit(form)

        expect(form.result.current.errors).toEqual({
            name: "required",
            email: "required",
            message: "tooShort"
        })
        expect(form.result.current.summaryCount).toBe(3)
        expect(form.result.current.status).toBe("idle")
        expect(form.focus.name).toHaveBeenCalledTimes(1)
        expect(simulateContactSend).not.toHaveBeenCalled()
    })

    it("foca o primeiro inválido de novo ao repetir o envio sem corrigir", async () => {
        const form = renderForm()
        act(() => form.result.current.setField("name", "Ana"))

        await submit(form)
        await submit(form)

        expect(form.result.current.summaryCount).toBe(2)
        expect(form.focus.email).toHaveBeenCalledTimes(2)
        expect(form.focus.name).not.toHaveBeenCalled()
    })

    it("foca a mensagem quando só ela é inválida", async () => {
        const form = renderForm()
        fillValid(form)
        act(() => form.result.current.setField("message", "curta"))

        await submit(form)

        expect(form.focus.message).toHaveBeenCalledTimes(1)
    })

    it("revalida só o campo alterado e mantém a contagem do resumo", async () => {
        const form = renderForm()
        await submit(form)

        act(() => form.result.current.setField("name", "Ana"))

        expect(form.result.current.errors).toEqual({ email: "required", message: "tooShort" })
        expect(form.result.current.summaryCount).toBe(3)

        act(() => form.result.current.setField("email", "ana@"))

        expect(form.result.current.errors.email).toBe("invalid")
        expect(form.result.current.summaryCount).toBe(3)
    })

    it("esconde o resumo quando não sobra erro e recontando no próximo envio", async () => {
        const form = renderForm()
        await submit(form)

        act(() => {
            form.result.current.setField("name", "Ana")
            form.result.current.setField("email", "ana@example.com")
            form.result.current.setField("message", VALID_MESSAGE)
        })

        expect(form.result.current.errors).toEqual({})
        expect(form.result.current.summaryCount).toBe(0)

        act(() => form.result.current.setField("name", ""))
        expect(form.result.current.summaryCount).toBe(0)

        await submit(form)

        expect(form.result.current.summaryCount).toBe(1)
    })

    it("envia: entra em sending e ignora o segundo envio", async () => {
        const gate = Promise.withResolvers<void>()
        vi.mocked(simulateContactSend).mockReturnValue(gate.promise)
        const form = renderForm()
        fillValid(form)

        let first: Promise<void> = Promise.resolve()
        act(() => {
            first = form.result.current.submit()
        })
        await act(async () => {
            await form.result.current.submit()
        })

        expect(form.result.current.status).toBe("sending")
        expect(simulateContactSend).toHaveBeenCalledTimes(1)

        await act(async () => {
            gate.resolve()
            await first
        })

        expect(form.result.current.status).toBe("sent")
        expect(form.focus.sentHeading).toHaveBeenCalledTimes(1)
    })

    it("depois de enviado, reset volta ao formulário vazio e foca o Nome", async () => {
        const form = renderForm()
        fillValid(form)
        act(() => form.result.current.setField("subject", "job"))
        await submit(form)
        form.focus.name.mockClear()

        act(() => form.result.current.reset())

        expect(form.result.current.status).toBe("idle")
        expect(form.result.current.values).toEqual({
            name: "",
            email: "",
            subject: "newProject",
            message: ""
        })
        expect(form.result.current.errors).toEqual({})
        expect(form.result.current.summaryCount).toBe(0)
        expect(form.focus.name).toHaveBeenCalledTimes(1)
    })

    it("na falha mantém os valores, foca o botão e limpa a falha no próximo envio", async () => {
        vi.mocked(simulateContactSend).mockRejectedValueOnce(new Error("falhou"))
        const form = renderForm()
        fillValid(form)

        await submit(form)

        expect(form.result.current.status).toBe("failed")
        expect(form.result.current.values.email).toBe("ana@example.com")
        expect(form.focus.submit).toHaveBeenCalledTimes(1)

        await submit(form)

        expect(form.result.current.status).toBe("sent")
    })

    it("conta os restantes sem trim e anuncia só ao cruzar 60 e ao chegar a 0", () => {
        const form = renderForm()
        expect(form.result.current.remaining).toBe(600)

        act(() => form.result.current.setField("message", " ".repeat(500)))
        expect(form.result.current.remaining).toBe(100)
        expect(form.result.current.announcement).toBeNull()
    })

    it("anuncia a quantidade restante ao passar de 60 para menos de 60", () => {
        const form = renderForm()

        act(() => form.result.current.setField("message", "a".repeat(541)))
        expect(form.result.current.announcement).toEqual({ kind: "nearLimit", count: 59 })

        act(() => form.result.current.setField("message", "a".repeat(542)))
        expect(form.result.current.announcement).toEqual({ kind: "nearLimit", count: 59 })
    })

    it("anuncia o limite ao chegar a 0 e limpa ao voltar acima de 60", () => {
        const form = renderForm()

        act(() => form.result.current.setField("message", "a".repeat(599)))
        act(() => form.result.current.setField("message", "a".repeat(600)))
        expect(form.result.current.remaining).toBe(0)
        expect(form.result.current.announcement).toEqual({ kind: "limitReached" })

        act(() => form.result.current.setField("message", "a".repeat(100)))
        expect(form.result.current.announcement).toBeNull()
    })

    it("envia o payload com idioma, assunto e website vazio", async () => {
        vi.mocked(simulateContactSend).mockReturnValue(new Promise<void>(() => undefined))
        const form = renderForm()
        fillValid(form)
        act(() => form.result.current.setField("subject", "freelance"))

        act(() => {
            void form.result.current.submit()
        })

        const pending = form.actions.find(
            (action) => isRecord(action) && action.type === "api/executeMutation/pending"
        )

        expect(
            isRecord(pending) && isRecord(pending.meta) && isRecord(pending.meta.arg)
                ? pending.meta.arg.originalArgs
                : undefined
        ).toEqual({
            name: "Ana",
            email: "ana@example.com",
            subject: "freelance",
            message: VALID_MESSAGE,
            language: "pt-BR",
            website: ""
        })
    })
})
