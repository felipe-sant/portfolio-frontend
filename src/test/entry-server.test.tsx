import { ReadableStream } from "node:stream/web"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import listTargets from "@scripts/prerender/listTargets"
import render from "@/entry-server"
import prerenderRoutes from "@/prerender/prerenderRoutes"
import routes from "@/routers/routes"
import buildProfile from "@/testUtils/buildProfile"
import stubContentFetch from "@/testUtils/stubContentFetch"

const EXPECTED_BY_FILE: Record<string, { heading: string; content: string; language: string }> = {
    "pt-BR.html": {
        heading: "Desenvolvedor full stack em TypeScript",
        content: "Trabalho em produtos web de ponta a ponta, do banco à interface.",
        language: "pt-BR"
    },
    "en.html": {
        heading: "Full stack developer in TypeScript",
        content: "I build web products end to end, from the database to the interface.",
        language: "en"
    },
    "es.html": {
        heading: "Desarrollador full stack en TypeScript",
        content: "Trabajo en productos web de punta a punta, de la base de datos a la interfaz.",
        language: "es"
    },
    "404.html": {
        heading: "Page not found",
        content: "The address may have changed or the project is no longer online.",
        language: "en"
    }
}

const { targets } = listTargets(routes, prerenderRoutes, { "pt-BR": [], en: [], es: [] })

beforeEach(() => {
    vi.stubGlobal("ReadableStream", ReadableStream)
    stubContentFetch({
        "content/pt-BR/profile.json": buildProfile(),
        "content/en/profile.json": buildProfile(),
        "content/es/profile.json": buildProfile()
    })
})

afterEach(() => {
    vi.unstubAllGlobals()
    window.history.pushState({}, "", "/")
})

describe("render", () => {
    it.each(targets.map((target) => [target.file, target] as const))(
        "renderiza %s com o h1, o conteúdo principal e o rodapé com o perfil",
        async (file, target) => {
            const expected = EXPECTED_BY_FILE[file]

            const result = await render(target)

            expect(result.html).toContain(`<h1>${expected.heading}</h1>`)
            expect(result.html).toContain(expected.content)
            expect(result.html).toContain("contato@example.com")
            expect(result.language).toBe(expected.language)
        }
    )

    it.each([
        ["pt-BR.html", "pt-BR"],
        ["en.html", "en"],
        ["es.html", "es"]
    ])("declara canônica, quatro hreflang e JSON-LD em %s", async (file, language) => {
        const target = targets.find((item) => item.file === file)
        if (!target) {
            throw new Error(`Alvo ${file} não encontrado`)
        }

        const { html } = await render(target)

        expect(html).toContain(`<link rel="canonical" href="http://localhost:5173/${language}"/>`)
        expect(html.match(/<link rel="alternate" hrefLang="[^"]+"/g)).toHaveLength(4)
        expect(html).toContain('hrefLang="x-default" href="http://localhost:5173/en"')
        expect(html).toContain('<script type="application/ld+json">')
        expect(html).toContain(`http://localhost:5173/${language}#person`)
        expect(html).toContain("https://github.com/example")
    })

    it("não declara canônica, hreflang, Open Graph nem JSON-LD no 404.html", async () => {
        const target = targets.find((item) => item.file === "404.html")
        if (!target) {
            throw new Error("Alvo 404.html não encontrado")
        }

        const { html } = await render(target)

        expect(html).not.toContain('rel="canonical"')
        expect(html).not.toContain("hrefLang")
        expect(html).not.toContain("og:title")
        expect(html).not.toContain("application/ld+json")
    })

    it("não deixa bloco de Suspense fora de linha nem o fallback de carregamento", async () => {
        for (const target of targets) {
            const { html } = await render(target)

            expect(html).not.toContain('id="S:')
            expect(html).not.toContain("Carregando")
            expect(html).not.toContain("Loading")
        }
    })

    it("devolve o estado da store e os dados do roteador como JSON sem menor cru", async () => {
        const result = await render(targets[0])

        expect(Object.keys(JSON.parse(result.state))).toContain("api")
        expect(JSON.parse(result.routerData)).toHaveProperty("loaderData")
        expect(result.state).not.toContain("<")
        expect(result.routerData).not.toContain("<")
    })

    it("escapa o menor como \\u003c no estado", async () => {
        stubContentFetch({
            "content/pt-BR/profile.json": buildProfile({ role: "</script><b>" })
        })

        const result = await render({
            path: "pt-BR",
            file: "pt-BR.html",
            lang: "pt-BR",
            pattern: ""
        })

        expect(result.state).toContain("\\u003c/script>\\u003cb>")
    })

    it("rejeita em português a rota que responde direto, como a raiz", async () => {
        await expect(render({ path: "", file: "index.html", lang: "en" })).rejects.toThrow(
            /não pode ser pré-renderizada/
        )
    })

    it("rejeita em português um alvo cujo padrão não está no registro", async () => {
        await expect(
            render({ path: "pt-BR/x", file: "pt-BR/x.html", lang: "pt-BR", pattern: "x" })
        ).rejects.toThrow(/não está no registro/)
    })

    it("falha com a rota e a causa quando o conteúdo não existe", async () => {
        stubContentFetch({})

        await expect(render(targets[0])).rejects.toThrow(/Falha ao carregar os dados da rota/)
    })

    it("usa uma store nova a cada chamada, com as mesmas consultas", async () => {
        const first = await render(targets[0])
        const second = await render(targets[0])

        expect(Object.keys(JSON.parse(second.state).api.queries)).toEqual(
            Object.keys(JSON.parse(first.state).api.queries)
        )
    })
})
