import { afterEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ContactForm from "@/components/ContactForm"
import setLanguage from "@/i18n/setLanguage"
import simulateContactSend from "@/services/content/simulateContactSend"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import relaxAsyncUtilTimeout from "@/testUtils/relaxAsyncUtilTimeout"
import renderWithStore from "@/testUtils/renderWithStore"

vi.mock("@/services/content/simulateContactSend", () => ({
    default: vi.fn(() => Promise.resolve())
}))

relaxAsyncUtilTimeout()

const MESSAGE = "Preciso de um site para a minha loja."

function renderForm() {
    return renderWithStore(<ContactForm />)
}

async function fillField(field: HTMLElement, text: string) {
    await userEvent.click(field)
    await userEvent.paste(text)
}

async function fillValid() {
    await fillField(screen.getByLabelText(/^Nome/), "Ana")
    await fillField(screen.getByLabelText(/^E-mail/), "ana@example.com")
    await fillField(screen.getByLabelText(/^Mensagem/), MESSAGE)
}

async function submit() {
    await userEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }))
}

afterEach(() => {
    vi.mocked(simulateContactSend).mockReset()
    vi.mocked(simulateContactSend).mockResolvedValue(undefined)
    localStorage.clear()
    sessionStorage.clear()
})

describe("ContactForm", () => {
    it("mostra a seção com nome, frase de obrigatórios, campos, botão e nota na ordem", () => {
        const { container } = renderForm()
        const section = screen.getByRole("region", { name: "Formulário de contato" })
        const order = [
            screen.getByText("Todos os campos são obrigatórios."),
            screen.getByLabelText(/^Nome/),
            screen.getByLabelText(/^E-mail/),
            screen.getByRole("group", { name: "Assunto" }),
            screen.getByLabelText(/^Mensagem/),
            screen.getByRole("button", { name: "Enviar mensagem" }),
            screen.getByText("Sem newsletter e sem cadastro.")
        ]

        order.forEach((element, index) => {
            expect(section).toContainElement(element)
            if (index > 0) {
                const previous = order[index - 1] as HTMLElement
                expect(
                    previous.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING
                ).toBeTruthy()
            }
        })
        expect(container.querySelector("form#contact-form")).toBeInTheDocument()
    })

    it("liga rótulos, autocomplete, type, aria-required e noValidate", () => {
        const { container } = renderForm()
        const name = screen.getByLabelText(/^Nome/)
        const email = screen.getByLabelText(/^E-mail/)
        const message = screen.getByLabelText(/^Mensagem/)

        expect(name).toHaveAttribute("autocomplete", "name")
        expect(email).toHaveAttribute("type", "email")
        expect(email).toHaveAttribute("inputmode", "email")
        expect(email).toHaveAttribute("autocomplete", "email")
        ;[name, email, message].forEach((field) =>
            expect(field).toHaveAttribute("aria-required", "true")
        )
        expect(container.querySelector("form")).toHaveAttribute("novalidate")
    })

    it("define maxLength e o textarea de 6 linhas com placeholder", () => {
        renderForm()
        const message = screen.getByLabelText(/^Mensagem/)

        expect(screen.getByLabelText(/^Nome/)).toHaveAttribute("maxlength", "100")
        expect(screen.getByLabelText(/^E-mail/)).toHaveAttribute("maxlength", "254")
        expect(message).toHaveAttribute("maxlength", "600")
        expect(message).toHaveAttribute("rows", "6")
        expect(message).toHaveAttribute("placeholder", "Escopo, prazo e links do que já existe")
    })

    it("mostra o assunto em fieldset com quatro rádios de mesmo name e as setas trocam", async () => {
        renderForm()
        const group = screen.getByRole("group", { name: "Assunto" })
        const radios = within(group).getAllByRole("radio")

        expect(group.tagName).toBe("FIELDSET")
        expect(radios.map((radio) => radio.closest("label")?.textContent)).toEqual([
            "Projeto novo",
            "Freelance",
            "Vaga",
            "Outro"
        ])
        expect(new Set(radios.map((radio) => radio.getAttribute("name"))).size).toBe(1)
        expect(radios[0]).toBeChecked()
        radios.forEach((radio) => expect(radio).not.toHaveAttribute("aria-pressed"))

        radios[0]?.focus()
        await userEvent.keyboard("{ArrowRight}")

        expect(radios[1]).toBeChecked()
    })

    it("só os rádios têm o atributo name", () => {
        const { container } = renderForm()

        container.querySelectorAll("input[type=radio]").forEach((radio) => {
            expect(radio).toHaveAttribute("name")
        })
        expect(screen.getByLabelText(/^Nome/)).not.toHaveAttribute("name")
        expect(screen.getByLabelText(/^E-mail/)).not.toHaveAttribute("name")
        expect(screen.getByLabelText(/^Mensagem/)).not.toHaveAttribute("name")
    })

    it("mostra o contador ligado ao textarea, sem aria-live", () => {
        const { container } = renderForm()
        const counter = screen.getByText("600 restantes")

        expect(screen.getByLabelText(/^Mensagem/)).toHaveAccessibleDescription("600 restantes")
        expect(counter).not.toHaveAttribute("aria-live")
        expect(container.querySelectorAll("[aria-live]")).toHaveLength(1)
    })

    it("anuncia só ao cruzar 60 restantes e ao chegar a 0", () => {
        const { container } = renderForm()
        const live = container.querySelector("[aria-live=polite]") as HTMLElement
        const message = screen.getByLabelText(/^Mensagem/)

        fireEvent.change(message, { target: { value: "a".repeat(500) } })
        expect(live).toBeEmptyDOMElement()

        fireEvent.change(message, { target: { value: "a".repeat(541) } })
        expect(live).toHaveTextContent("Restam 59 caracteres.")

        fireEvent.change(message, { target: { value: "a".repeat(545) } })
        expect(live).toHaveTextContent("Restam 59 caracteres.")

        fireEvent.change(message, { target: { value: "a".repeat(600) } })
        expect(live).toHaveTextContent("Você chegou ao limite de 600 caracteres.")
        expect(screen.getByText("Nenhum caractere restante.")).toBeInTheDocument()
    })

    it("no envio vazio mostra o resumo, os erros por campo e foca o Nome", async () => {
        renderForm()

        await submit()

        const summary = screen.getByRole("alert")
        const name = screen.getByLabelText(/^Nome/)

        expect(summary).toHaveTextContent("Falta corrigir 3 campos.")
        expect(screen.getAllByRole("alert")).toHaveLength(1)
        expect(name).toHaveAttribute("aria-invalid", "true")
        expect(name).toHaveAccessibleDescription("Diga como devo te chamar.")
        expect(screen.getByLabelText(/^E-mail/)).toHaveAccessibleDescription(
            "Preciso de um e-mail para responder."
        )
        expect(screen.getByLabelText(/^Mensagem/)).toHaveAccessibleDescription(
            "Escreva um pouco mais: 20 caracteres no mínimo. 600 restantes"
        )
        expect(name).toHaveFocus()
    })

    it("depois do erro, corrigir limpa a mensagem e o resumo some sem erro", async () => {
        renderForm()
        await submit()

        await fillValid()

        expect(screen.getByLabelText(/^Nome/)).not.toHaveAttribute("aria-invalid")
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
        expect(screen.queryByText("Diga como devo te chamar.")).not.toBeInTheDocument()
    })

    it("enviando: campos e rádios desabilitados, botão ocupado e segundo clique ignorado", async () => {
        const gate = Promise.withResolvers<void>()
        vi.mocked(simulateContactSend).mockReturnValue(gate.promise)
        renderForm()
        await fillValid()

        await submit()

        const button = screen.getByRole("button", { name: "Enviando" })

        expect(button).toHaveAttribute("aria-disabled", "true")
        expect(button).toHaveAttribute("aria-busy", "true")
        expect(button).not.toBeDisabled()
        expect(screen.getByLabelText(/^Nome/)).toBeDisabled()
        screen.getAllByRole("radio").forEach((radio) => expect(radio).toBeDisabled())
        expect(button.querySelector('[aria-hidden="true"]')).toBeInTheDocument()

        await userEvent.click(button)

        expect(simulateContactSend).toHaveBeenCalledTimes(1)

        await act(async () => gate.resolve())
    })

    it("enviado: título em h2 focado no contêiner status e Enviar outra mensagem volta vazio", async () => {
        renderForm()
        const status = screen.getByRole("status")
        expect(status).toBeEmptyDOMElement()
        await fillValid()
        await userEvent.click(screen.getByRole("radio", { name: "Vaga" }))

        await submit()

        const heading = await screen.findByRole("heading", { level: 2, name: "Mensagem enviada" })

        expect(screen.getByRole("status")).toBe(status)
        expect(status).toContainElement(heading)
        expect(heading).toHaveAttribute("tabindex", "-1")
        await waitFor(() => expect(heading).toHaveFocus())
        expect(
            screen.getByText("Recebi sua mensagem e respondo pelo e-mail que você informou.")
        ).toBeInTheDocument()

        await userEvent.click(screen.getByRole("button", { name: "Enviar outra mensagem" }))

        expect(screen.getByLabelText(/^Nome/)).toHaveValue("")
        expect(screen.getByLabelText(/^Nome/)).toHaveFocus()
        expect(screen.getByRole("radio", { name: "Projeto novo" })).toBeChecked()
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it("falha: banner de alerta, dados mantidos, foco no botão e banner some no próximo envio", async () => {
        vi.mocked(simulateContactSend).mockRejectedValueOnce(new Error("falhou"))
        renderForm()
        await fillValid()

        await submit()

        const banner = await screen.findByRole("alert")

        expect(banner).toHaveTextContent(
            "Não consegui enviar sua mensagem. Tente de novo ou escreva para o e-mail desta página."
        )
        expect(screen.getByLabelText(/^Nome/)).toHaveValue("Ana")
        expect(screen.getByLabelText(/^Nome/)).toBeEnabled()
        await waitFor(() =>
            expect(screen.getByRole("button", { name: "Enviar mensagem" })).toHaveFocus()
        )

        await submit()

        await screen.findByRole("heading", { name: "Mensagem enviada" })
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it("não guarda nada em localStorage nem em sessionStorage", async () => {
        renderForm()
        await fillValid()
        await submit()
        await screen.findByRole("heading", { name: "Mensagem enviada" })

        expect(localStorage).toHaveLength(0)
        expect(sessionStorage).toHaveLength(0)
    })

    it.each([
        ["en", "Contact form", "Send message", "Message sent"],
        ["es", "Formulario de contacto", "Enviar mensaje", "Mensaje enviado"]
    ] as const)("mostra o texto sem chave em %s", async (language, label, submitText, sent) => {
        renderForm()
        await act(() => setLanguage(language))

        expect(screen.getByRole("region", { name: label })).toBeInTheDocument()
        await userEvent.click(screen.getByRole("button", { name: submitText }))
        expect(screen.getByRole("alert")).not.toHaveTextContent(/form\./)

        const [name, email, message] = screen.getAllByRole("textbox")
        await fillField(name as HTMLElement, "Ana")
        await fillField(email as HTMLElement, "ana@example.com")
        await fillField(message as HTMLElement, MESSAGE)
        await userEvent.click(screen.getByRole("button", { name: submitText }))

        expect(await screen.findByRole("heading", { name: sent })).toBeInTheDocument()
        expect(document.body).not.toHaveTextContent(/form\.|contact:/)
    })

    it.each([
        ["en", "No characters left."],
        ["es", "Ningún carácter restante."]
    ] as const)("mostra o contador zerado sem número em %s", async (language, zeroText) => {
        renderForm()
        await act(() => setLanguage(language))

        fireEvent.change(screen.getAllByRole("textbox")[2] as HTMLElement, {
            target: { value: "a".repeat(600) }
        })

        expect(screen.getByText(zeroText)).toBeInTheDocument()
    })

    it("não tem violações de acessibilidade no estado normal", async () => {
        const { container } = renderForm()

        await expectNoAxeViolations(container)
    })

    it("não tem violações de acessibilidade com erros e resumo", async () => {
        const { container } = renderForm()
        await submit()

        await expectNoAxeViolations(container)
    })

    it("não tem violações de acessibilidade enviando", async () => {
        const gate = Promise.withResolvers<void>()
        vi.mocked(simulateContactSend).mockReturnValue(gate.promise)
        const { container } = renderForm()
        await fillValid()
        await submit()

        await expectNoAxeViolations(container)

        await act(async () => gate.resolve())
    })

    it("não tem violações de acessibilidade enviado", async () => {
        const { container } = renderForm()
        await fillValid()
        await submit()
        await screen.findByRole("heading", { name: "Mensagem enviada" })

        await expectNoAxeViolations(container)
    })

    it("não tem violações de acessibilidade na falha de envio", async () => {
        vi.mocked(simulateContactSend).mockRejectedValueOnce(new Error("falhou"))
        const { container } = renderForm()
        await fillValid()
        await submit()
        await screen.findByRole("alert")

        await expectNoAxeViolations(container)
    })
})
