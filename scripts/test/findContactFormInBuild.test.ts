import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import findContactFormInBuild from "@scripts/contactForm/findContactFormInBuild"

let directory = ""

async function writeBuildFile(path: string, content: string) {
    const target = join(directory, path)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, content)
}

beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "contact-form-build-"))
})

afterEach(async () => {
    await rm(directory, { recursive: true, force: true })
})

describe("findContactFormInBuild", () => {
    it("lança erro em português quando o diretório do build não existe", async () => {
        await expect(findContactFormInBuild(join(directory, "ausente"))).rejects.toThrow(
            /não existe/
        )
    })

    it("lança erro em português quando o diretório do build está vazio", async () => {
        await expect(findContactFormInBuild(directory)).rejects.toThrow(/vazio/)
    })

    it("devolve lista vazia quando o HTML de contato não tem o formulário", async () => {
        await writeBuildFile("pt-BR/contact.html", "<main><h1>Contato</h1></main>")
        await writeBuildFile("assets/ContactForm-abc.js", 'id="contact-form"')
        await writeBuildFile("assets/Contact.page-abc.js", 'import("./ContactForm-abc.js")')

        expect(await findContactFormInBuild(directory)).toEqual([])
    })

    it("reprova e cita o arquivo quando um HTML tem o formulário", async () => {
        await writeBuildFile("pt-BR/contact.html", "<main></main>")
        await writeBuildFile("en/contact.html", '<form id="contact-form"></form>')

        const reasons = await findContactFormInBuild(directory)

        expect(reasons).toHaveLength(1)
        expect(reasons[0]).toContain(join("en", "contact.html"))
        expect(reasons[0]).toContain("contact-form")
    })

    it("reprova e cita o arquivo quando um HTML referencia o chunk ContactForm", async () => {
        await writeBuildFile(
            "es/contact.html",
            '<link rel="stylesheet" href="/assets/ContactForm-aiTs.css">'
        )

        const reasons = await findContactFormInBuild(directory)

        expect(reasons).toHaveLength(1)
        expect(reasons[0]).toContain(join("es", "contact.html"))
        expect(reasons[0]).toContain("ContactForm")
    })

    it("não conta o ContactForm-*.js que existe sem ser referenciado pelo HTML", async () => {
        await writeBuildFile("pt-BR.html", "<h1>Início</h1>")
        await writeBuildFile("assets/ContactForm-abc.js", 'ContactForm-abc.js id="contact-form"')

        expect(await findContactFormInBuild(directory)).toEqual([])
    })

    it("ignora arquivos que não são HTML", async () => {
        await writeBuildFile("pt-BR.html", "<h1>Início</h1>")
        await writeBuildFile("llms.txt", 'id="contact-form"')

        expect(await findContactFormInBuild(directory)).toEqual([])
    })
})
