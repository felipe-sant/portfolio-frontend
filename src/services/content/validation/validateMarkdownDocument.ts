import getMarkdownText from "@/services/content/validation/getMarkdownText"
import parseMarkdown from "@/services/content/validation/parseMarkdown"
import walkMarkdown from "@/services/content/validation/walkMarkdown"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type { Nodes } from "mdast"

const ALLOWED_PROTOCOLS = ["https:", "http:", "mailto:"]
const PROJECT_LINK_PATTERN = /^project:([^/#]+)(?:\/docs\/([^#]+))?(?:#.+)?$/
const ANCHOR_PATTERN = /^#\S+$/
const TABLE_ROW_PATTERN = /^\s*\|.*\|\s*$/

function hasAllowedProtocol(url: string): boolean {
    return URL.canParse(url) && ALLOWED_PROTOCOLS.includes(new URL(url).protocol)
}

function isAllowedUrl(url: string, projectDocuments: Record<string, string[]>): string | undefined {
    if (ANCHOR_PATTERN.test(url) || hasAllowedProtocol(url)) {
        return undefined
    }

    const projectLink = PROJECT_LINK_PATTERN.exec(url)

    if (!projectLink) {
        return `URL não permitida: ${url}`
    }

    const [, projectId, documentName] = projectLink
    const documents = projectDocuments[projectId]

    if (!documents) {
        return `Link para projeto inexistente: ${projectId}`
    }
    if (documentName !== undefined && !documents.includes(documentName)) {
        return `Link para documento inexistente: ${projectId}/docs/${documentName}`
    }

    return undefined
}

function validateNode(node: Nodes, projectDocuments: Record<string, string[]>): string | undefined {
    switch (node.type) {
        case "html":
            return "HTML não é permitido"
        case "image":
        case "imageReference":
            return "Imagem não é permitida"
        case "footnoteDefinition":
        case "footnoteReference":
            return "Nota de rodapé não é permitida"
        case "heading":
            return node.depth === 1 ? "Título # não é permitido; comece em ##" : undefined
        case "code":
            return node.lang ? undefined : "Bloco de código sem linguagem"
        case "table":
            return node.children[0]?.children.every((cell) => getMarkdownText(cell).trim() === "")
                ? "Tabela sem linha de cabeçalho preenchida"
                : undefined
        case "paragraph":
            return getMarkdownText(node)
                .split("\n")
                .some((line) => TABLE_ROW_PATTERN.test(line))
                ? "Tabela sem linha de cabeçalho"
                : undefined
        case "link":
        case "definition":
            return isAllowedUrl(node.url, projectDocuments)
        default:
            return undefined
    }
}

function validateMarkdownDocument(
    path: string,
    text: string,
    projectDocuments: Record<string, string[]>
): ContentIssue[] {
    const issues: ContentIssue[] = []

    walkMarkdown(parseMarkdown(text), (node) => {
        const message = validateNode(node, projectDocuments)

        if (message) {
            issues.push({ path: `${path}#linha ${node.position?.start.line ?? 0}`, message })
        }
    })

    return issues
}

export default validateMarkdownDocument
