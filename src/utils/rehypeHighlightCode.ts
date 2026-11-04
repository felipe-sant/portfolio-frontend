import type { Element, ElementContent, Root, RootContent } from "hast"
import { createLowlight } from "lowlight"
import CODE_LANGUAGE_ALIASES from "@/utils/codeLanguageAliases"
import CODE_LANGUAGES from "@/utils/codeLanguages"

const LANGUAGE_PREFIX = "language-"
const HIGHLIGHT_CLASS = "hljs"
const PLAIN_TEXT_LANGUAGES = ["mermaid"]

const lowlight = createLowlight(CODE_LANGUAGES)
lowlight.registerAlias(CODE_LANGUAGE_ALIASES)

function readText(nodes: ElementContent[]): string {
    return nodes
        .map((node) => {
            if (node.type === "text") {
                return node.value
            }

            return node.type === "element" ? readText(node.children) : ""
        })
        .join("")
}

function readLanguage(code: Element): string | undefined {
    const classes = Array.isArray(code.properties.className) ? code.properties.className : []

    return classes
        .map(String)
        .find((name) => name.startsWith(LANGUAGE_PREFIX))
        ?.slice(LANGUAGE_PREFIX.length)
}

function highlightCode(code: Element) {
    const language = readLanguage(code)

    if (!language || PLAIN_TEXT_LANGUAGES.includes(language)) {
        return
    }

    const classes = Array.isArray(code.properties.className) ? code.properties.className : []
    code.properties.className = [HIGHLIGHT_CLASS, ...classes]

    if (!lowlight.registered(language)) {
        return
    }

    const result = lowlight.highlight(language, readText(code.children))

    const children = result.children.filter(
        (child): child is ElementContent => child.type !== "doctype"
    )

    if (children.length > 0) {
        code.children = children
    }
}

function visitBlocks(nodes: RootContent[]) {
    for (const node of nodes) {
        if (node.type !== "element") {
            continue
        }

        if (node.tagName === "pre") {
            node.children.forEach((child) => {
                if (child.type === "element" && child.tagName === "code") {
                    highlightCode(child)
                }
            })
        }

        visitBlocks(node.children)
    }
}

function rehypeHighlightCode() {
    return (tree: Root) => {
        visitBlocks(tree.children)
    }
}

export default rehypeHighlightCode
