import { describe, expect, it } from "vitest"
import composePage from "@scripts/prerender/composePage"
import type PrerenderResult from "@/types/prerender/PrerenderResult.types"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"

const TEMPLATE = `<!doctype html>
<html lang="pt-BR">
    <head>
        <meta charset="utf-8" />
        <meta
            name="description"
            content="Descrição do index"
        />
        <title>Título do index</title>
        <link rel="icon" href="/favicon.svg" />
    </head>
    <body>
        <noscript>Texto antigo</noscript>
        <div id="root"></div>
        <script type="module" src="/src/entry-client.tsx"></script>
    </body>
</html>`

const TARGET: PrerenderTarget = { path: "en", file: "en.html", lang: "en" }

function buildResult(overrides: Partial<PrerenderResult> = {}): PrerenderResult {
    return {
        html: '<title>Page</title><meta name="description" content="About"/><link rel="canonical" href="https://example.com/en"/><script type="application/ld+json">{"a":1}</script><div><h1>Hello</h1></div>',
        state: '{"api":{"text":"\\u003c/script>"}}',
        routerData: '{"loaderData":{}}',
        language: "en",
        ...overrides
    }
}

function compose(result: PrerenderResult = buildResult()) {
    return composePage(TEMPLATE, result, TARGET, "Needs JavaScript", "/ra2581392423047/")
}

describe("composePage", () => {
    it("troca o lang do html pelo idioma do resultado", () => {
        expect(compose()).toContain('<html lang="en"')
        expect(compose()).not.toContain('<html lang="pt-BR"')
    })

    it("deixa um único title e uma única meta description", () => {
        const page = compose()

        expect(page.match(/<title>/g)).toHaveLength(1)
        expect(page).toContain("<title>Page</title>")
        expect(page.match(/name="description"/g)).toHaveLength(1)
        expect(page).toContain('content="About"')
    })

    it("move title, meta, link e ld+json do React para o head", () => {
        const page = compose()
        const head = page.slice(0, page.indexOf("</head>"))

        expect(head).toContain('<link rel="canonical" href="https://example.com/en"/>')
        expect(head).toContain('<script type="application/ld+json">{"a":1}</script>')
        expect(head).toContain('<link rel="icon" href="/favicon.svg" />')
    })

    it("coloca o corpo dentro de #root", () => {
        expect(compose()).toContain('<div id="root"><div><h1>Hello</h1></div></div>')
    })

    it("troca o texto do noscript", () => {
        const page = compose()

        expect(page).toContain("<noscript>Needs JavaScript</noscript>")
        expect(page).not.toContain("Texto antigo")
    })

    it("escapa o texto do noscript", () => {
        const page = composePage(TEMPLATE, buildResult(), TARGET, "A < B", "/")

        expect(page).toContain("<noscript>A &lt; B</noscript>")
    })

    it("grava o caminho pré-renderizado com o base, o estado e os dados do roteador", () => {
        const page = compose()

        expect(page).toContain('window.prerenderedPath="/ra2581392423047/en"')
        expect(page).toContain('window.preloadedState={"api":{"text":"\\u003c/script>"}}')
        expect(page).toContain('window.routerData={"loaderData":{}}')
    })

    it("não deixa menor cru dentro do script de dados", () => {
        const script = compose().match(/<script>window\.prerenderedPath[\s\S]*?<\/script>/)?.[0]

        expect(script?.slice(8, -9)).not.toContain("<")
    })

    it("falha em português se o HTML tiver bloco de Suspense fora de linha", () => {
        const result = buildResult({ html: '<div hidden id="S:0">x</div>' })

        expect(() => compose(result)).toThrow(/Suspense fora de linha/)
    })

    it("falha em português se o molde não tiver #root", () => {
        expect(() =>
            composePage("<html><head></head></html>", buildResult(), TARGET, "x", "/")
        ).toThrow(/não tem/)
    })

    it("mantém o conteúdo literal quando o HTML tem padrões de substituição", () => {
        const page = compose(buildResult({ html: "<p>custa $& e $1</p>" }))

        expect(page).toContain("<p>custa $& e $1</p>")
    })
})
