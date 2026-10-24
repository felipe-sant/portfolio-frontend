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
