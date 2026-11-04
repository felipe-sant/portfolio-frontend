import { afterEach, describe, expect, it, vi } from "vitest"
import { act, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import simulateContactSend from "@/services/content/simulateContactSend"
import contactApi from "@/store/api/contact.api"
import renderWithStore from "@/testUtils/renderWithStore"
import type ContactMessage from "@/types/contact/ContactMessage.types"

vi.mock("@/services/content/simulateContactSend", () => ({
    default: vi.fn(() => Promise.resolve())
}))

const MESSAGE: ContactMessage = {
    name: "Ana",
    email: "ana-sentinel@example.com",
    subject: "freelance",
    message: "Preciso de um site para a minha loja.",
    language: "pt-BR",
    website: ""
}

function Probe() {
    const [send, { isSuccess, isError, error }] = contactApi.useSendContactMessageMutation()

    return (
        <>
            <button type="button" onClick={() => send(MESSAGE)}>
                enviar
            </button>
            <p data-testid="result">{JSON.stringify({ isSuccess, isError, error })}</p>
        </>
    )
}

async function resultOf() {
    return JSON.parse(screen.getByTestId("result").textContent ?? "")
}

afterEach(() => {
    vi.unstubAllGlobals()
    vi.mocked(simulateContactSend).mockReset()
    vi.mocked(simulateContactSend).mockResolvedValue(undefined)
    localStorage.clear()
    sessionStorage.clear()
})

describe("contactApi", () => {
    it("resolve com sucesso com o argumento no formato de ContactMessage", async () => {
        renderWithStore(<Probe />)

        await userEvent.click(screen.getByRole("button", { name: "enviar" }))

        await waitFor(async () => expect((await resultOf()).isSuccess).toBe(true))
        expect(simulateContactSend).toHaveBeenCalledTimes(1)
    })

    it("devolve erro no formato do contrato quando a simulação rejeita", async () => {
        vi.mocked(simulateContactSend).mockRejectedValueOnce(new Error("falhou"))
        renderWithStore(<Probe />)

        await userEvent.click(screen.getByRole("button", { name: "enviar" }))

        await waitFor(async () => expect((await resultOf()).isError).toBe(true))
        expect((await resultOf()).error).toEqual({ status: "FETCH_ERROR", error: "falhou" })
    })

    it("não faz requisição", async () => {
        const fetchMock = vi.fn()
        vi.stubGlobal("fetch", fetchMock)
        renderWithStore(<Probe />)

        await userEvent.click(screen.getByRole("button", { name: "enviar" }))

        await waitFor(async () => expect((await resultOf()).isSuccess).toBe(true))
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("não grava nada em localStorage nem em sessionStorage", async () => {
        renderWithStore(<Probe />)

        await userEvent.click(screen.getByRole("button", { name: "enviar" }))

        await waitFor(async () => expect((await resultOf()).isSuccess).toBe(true))
        expect(localStorage).toHaveLength(0)
        expect(sessionStorage).toHaveLength(0)
    })

    it("não guarda o payload na store depois que a tela sai", async () => {
        const { store, unmount } = renderWithStore(<Probe />)

        await userEvent.click(screen.getByRole("button", { name: "enviar" }))
        await waitFor(async () => expect((await resultOf()).isSuccess).toBe(true))
        act(() => unmount())

        expect(JSON.stringify(store.getState())).not.toContain("ana-sentinel@example.com")
    })
})
