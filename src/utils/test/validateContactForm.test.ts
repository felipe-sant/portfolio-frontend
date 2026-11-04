import { describe, expect, it } from "vitest"
import type ContactFormValues from "@/types/contact/ContactFormValues.types"
import validateContactForm from "@/utils/validateContactForm"

const VALID_MESSAGE = "a".repeat(20)

function valuesWith(overrides: Partial<ContactFormValues>): ContactFormValues {
    return {
        name: "Ana",
        email: "ana@example.com",
        subject: "newProject",
        message: VALID_MESSAGE,
        ...overrides
    }
}

describe("validateContactForm", () => {
    it("devolve objeto vazio quando tudo é válido", () => {
        expect(validateContactForm(valuesWith({}))).toEqual({})
    })

    it("erra a mensagem com 19 caracteres depois do trim", () => {
        expect(validateContactForm(valuesWith({ message: "a".repeat(19) }))).toEqual({
            message: "tooShort"
        })
    })

    it("aceita a mensagem com 20 caracteres", () => {
        expect(validateContactForm(valuesWith({ message: "a".repeat(20) }))).toEqual({})
    })

    it("erra a mensagem de 20 espaços", () => {
        expect(validateContactForm(valuesWith({ message: " ".repeat(20) }))).toEqual({
            message: "tooShort"
        })
    })

    it("conta o trim da mensagem", () => {
        expect(validateContactForm(valuesWith({ message: `  ${"a".repeat(19)}  ` }))).toEqual({
            message: "tooShort"
        })
    })

    it("erra o nome só com espaços", () => {
        expect(validateContactForm(valuesWith({ name: "   " }))).toEqual({ name: "required" })
    })

    it("aceita o nome com 1 caractere", () => {
        expect(validateContactForm(valuesWith({ name: "A" }))).toEqual({})
    })

    it.each(["", "   "])("devolve required, nunca invalid, para o e-mail %j", (email) => {
        expect(validateContactForm(valuesWith({ email }))).toEqual({ email: "required" })
    })

    it.each(["a@b.co", "  a@b.co  "])("aceita o e-mail %j", (email) => {
        expect(validateContactForm(valuesWith({ email }))).toEqual({})
    })

    it.each(["a@b", "a@b.c", "a b@c.de", "a@@b.de"])("reprova o e-mail %j", (email) => {
        expect(validateContactForm(valuesWith({ email }))).toEqual({ email: "invalid" })
    })

    it("nunca falha o assunto", () => {
        expect(validateContactForm(valuesWith({ subject: "other" }))).toEqual({})
    })

    it("devolve um erro por campo inválido", () => {
        expect(validateContactForm({ name: "", email: "", subject: "job", message: "" })).toEqual({
            name: "required",
            email: "required",
            message: "tooShort"
        })
    })
})
