import type PrerenderResult from "@/types/prerender/PrerenderResult.types"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"

const HOISTED_HEAD =
    /^(?:<title>[^<]*<\/title>|<meta\b[^>]*>|<link\b[^>]*>|<script type="application\/ld\+json">[\s\S]*?<\/script>)*/
const ROOT_PLACEHOLDER = '<div id="root"></div>'
const SUSPENSE_BOUNDARY = 'id="S:'

function escapeText(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function escapeScriptJson(text: string): string {
    return text.replace(/</g, "\\u003c")
}

function composePage(
    template: string,
    result: PrerenderResult,
    target: PrerenderTarget,
    noscriptText: string,
    base: string
): string {
    if (result.html.includes(SUSPENSE_BOUNDARY)) {
        throw new Error(
            `O HTML de "${target.path}" tem bloco de Suspense fora de linha: confira o progressiveChunkSize.`
        )
    }

    if (!template.includes(ROOT_PLACEHOLDER) || !template.includes("</head>")) {
        throw new Error(
            `O index.html não tem ${ROOT_PLACEHOLDER} nem </head> para receber o conteúdo de "${target.path}".`
        )
    }

    const head = HOISTED_HEAD.exec(result.html)?.[0] ?? ""
    const body = result.html.slice(head.length)
    const scripts = `<script>window.prerenderedPath=${escapeScriptJson(JSON.stringify(`${base}${target.path}`))};window.preloadedState=${result.state};window.routerData=${result.routerData}</script>`

    return template
        .replace(/<title>[^<]*<\/title>/, () => "")
        .replace(/<meta\s+name="description"[^>]*>/, () => "")
        .replace(/<html lang="[^"]*"/, () => `<html lang="${result.language}"`)
        .replace(
            /<noscript\s*>[\s\S]*?<\/noscript\s*>/,
            () => `<noscript>${escapeText(noscriptText)}</noscript>`
        )
        .replace("</head>", () => `${head}</head>`)
        .replace(ROOT_PLACEHOLDER, () => `<div id="root">${body}</div>${scripts}`)
}

export default composePage
