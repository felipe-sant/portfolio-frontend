import { describe, expect, it } from "vitest"
import composeRootPage from "@scripts/prerender/composeRootPage"
import removeRootPageItems from "@scripts/prerender/removeRootPageItems"
import type RootPageTexts from "@/types/prerender/RootPageTexts.types"

const REDIRECT_SCRIPT = `<script>
            (function () {
                var base = "%BASE_URL%";
                if (location.pathname !== base) { return; }
                location.replace(base + "en");
            })();
        </script>`

const THEME_SCRIPT = `<script>
            (function () { document.documentElement.setAttribute("data-theme", "light"); })();
        </script>`

const MOTION_SCRIPT = `<script>
            (function () { document.documentElement.setAttribute("data-motion", "full"); })();
        </script>`

const TEMPLATE = `<!doctype html>
<html lang="pt-BR">
    <head>
        <meta charset="utf-8" />
        ${REDIRECT_SCRIPT}
        <meta name="theme-color" content="#fbf9f5" media="(prefers-color-scheme: light)" />
        ${THEME_SCRIPT}
        ${MOTION_SCRIPT}
        <meta
            name="description"
            content="Descrição em português"
        />
        <title>
            Título em português
        </title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    </head>
    <body>
        <noscript
            >Aviso antigo</noscript
        >
        <div id="root"></div>
        <script type="module" src="/src/entry-client.tsx"></script>
    </body>
</html>`

const TEXTS: RootPageTexts = {
    title: "Title in English",
    description: "Description in English",
    languageLabel: "Language",
    heading: {
        "pt-BR": "Luiz Felipe dos Santos",
        en: "Luiz Felipe dos Santos",
        es: "Luiz Felipe dos Santos"
    },
    link: {
        "pt-BR": "Ver o portfólio em português",
        en: "View the portfolio in English",
        es: "Ver el portafolio en español"
    }
}

const ORIGIN = "https://fatec-jacarei-dsm-portfolio.github.io"
const BASE = "/ra2581392423047/"

function compose(template = TEMPLATE, texts = TEXTS) {
    return composeRootPage(template, texts, ORIGIN, BASE)
}

function countOf(html: string, pattern: RegExp): number {
    return html.match(pattern)?.length ?? 0
}

describe("composeRootPage", () => {
    it("é idempotente: aplicar duas vezes dá o mesmo HTML de uma", () => {
        const once = compose()
        const twice = compose(once)

        expect(twice).toBe(once)
        expect(countOf(twice, /rel="canonical"/g)).toBe(1)
        expect(countOf(twice, /hreflang="x-default"/g)).toBe(1)
        expect(countOf(twice, /<noscript/g)).toBe(1)
    })

    it("devolve o molde sem os itens da raiz quando parte de uma raiz já processada", () => {
        const cleaned = removeRootPageItems(compose())

        expect(cleaned).not.toContain('rel="canonical"')
        expect(cleaned).not.toContain("hreflang")
        expect(cleaned).not.toContain("og:")
        expect(cleaned).not.toContain("data-root")
        expect(removeRootPageItems(TEMPLATE)).toBe(TEMPLATE)
    })

    it("deixa o script de redirecionamento e os scripts inline byte a byte iguais", () => {
        const page = compose()

        expect(page).toContain(REDIRECT_SCRIPT)
        expect(page).toContain(THEME_SCRIPT)
        expect(page).toContain(MOTION_SCRIPT)
        expect(countOf(page, /<script>/g)).toBe(3)
        expect(countOf(removeRootPageItems(page), /<script>/g)).toBe(3)
    })

    it("monta canonical e quatro hreflang absolutos com o base e o href do noscript", () => {
        const page = compose()

        expect(page).toContain(
            '<link rel="canonical" href="https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/en">'
        )
        expect(page).toContain(
            '<link rel="alternate" hreflang="pt-BR" href="https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/pt-BR">'
        )
        expect(page).toContain(
            '<link rel="alternate" hreflang="es" href="https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/es">'
        )
        expect(page).toContain(
            '<link rel="alternate" hreflang="x-default" href="https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/en">'
        )
        expect(countOf(page, /<link rel="alternate" hreflang=/g)).toBe(4)
        expect(page).toContain('href="/ra2581392423047/en"')
    })

    it("troca lang, título e descrição pelos do en sem duplicar", () => {
        const page = compose()

        expect(page).toContain('<html lang="en"')
        expect(page).not.toContain('<html lang="pt-BR"')
        expect(countOf(page, /<title>/g)).toBe(1)
        expect(page).toContain("<title>Title in English</title>")
        expect(countOf(page, /name="description"/g)).toBe(1)
        expect(page).toContain('content="Description in English"')
        expect(page).not.toContain("Título em português")
        expect(page).not.toContain("Descrição em português")
    })

    it("acrescenta og:title, og:description, og:type, og:url e og:image absoluto", () => {
        const page = compose()

        expect(page).toContain('<meta property="og:title" content="Title in English">')
        expect(page).toContain('<meta property="og:description" content="Description in English">')
        expect(page).toContain('<meta property="og:type" content="website">')
        expect(page).toContain(
            '<meta property="og:url" content="https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/en">'
        )
        expect(page).toContain(
            '<meta property="og:image" content="https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/images/og-site.png">'
        )
    })

    it("substitui o noscript por h1 e nav com três links no idioma de cada um, com texto escapado", () => {
        const page = compose(TEMPLATE, {
            ...TEXTS,
            link: { ...TEXTS.link, es: "Ver <el> portafolio & más" }
        })
        const noscript = /<noscript data-root>([\s\S]*?)<\/noscript>/.exec(page)?.[1] ?? ""

        expect(countOf(page, /<noscript/g)).toBe(1)
        expect(page).not.toContain("Aviso antigo")
        expect(noscript).toContain("<h1>Luiz Felipe dos Santos</h1>")
        expect(noscript).toContain('<nav aria-label="Language">')
        expect(countOf(noscript, /<a /g)).toBe(3)
        expect(noscript).toContain(
            '<a href="/ra2581392423047/pt-BR" hreflang="pt-BR" lang="pt-BR">Ver o portfólio em português</a>'
        )
        expect(noscript).toContain(
            '<a href="/ra2581392423047/en" hreflang="en" lang="en">View the portfolio in English</a>'
        )
        expect(noscript).toContain(
            '<a href="/ra2581392423047/es" hreflang="es" lang="es">Ver &lt;el&gt; portafolio &amp; más</a>'
        )
    })

    it("falha em português se o molde não tiver o noscript ou o head", () => {
        expect(() => compose("<html><head></head><body></body></html>")).toThrow(/não tem/)
    })
})
