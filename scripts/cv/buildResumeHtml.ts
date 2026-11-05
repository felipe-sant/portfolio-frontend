import { readFileSync } from "node:fs"
import { join } from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

const STYLESHEET = join(process.cwd(), "scripts", "cv", "resume.css")
const FONTS_PLACEHOLDER = "__FONTS__"

function buildResumeHtml(language: SupportedLanguage, markdown: string, fontsUrl: string): string {
    const styles = readFileSync(STYLESHEET, "utf-8").replaceAll(FONTS_PLACEHOLDER, fontsUrl)
    const body = renderToStaticMarkup(
        createElement(Markdown, { remarkPlugins: [remarkGfm] }, markdown)
    )

    const title = renderToStaticMarkup(
        createElement("title", null, markdown.match(/^# (.+)$/m)?.[1] ?? "")
    )

    return `<!doctype html><html lang="${language}"><head><meta charset="utf-8" />${title}<style>${styles}</style></head><body>${body}</body></html>`
}

export default buildResumeHtml
