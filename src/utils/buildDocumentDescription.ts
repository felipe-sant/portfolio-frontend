const MAX_LENGTH = 155
const ELLIPSIS = "…"
const FENCE_PATTERN = /^\s*(```|~~~)/
const BLOCK_PATTERN = /^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>|\||<)/
const IMAGE_PATTERN = /!\[[^\]]*\]\([^)]*\)/g
const LINK_PATTERN = /\[([^\]]*)\]\([^)]*\)/g
const CODE_PATTERN = /`([^`]*)`/g
const BOLD_PATTERN = /\*\*(.+?)\*\*/g
const ITALIC_PATTERN = /\*(.+?)\*/g
const TRAILING_PATTERN = /[\s,.;:\-–—]+$/

function stripMarkdown(text: string): string {
    return text
        .replace(IMAGE_PATTERN, "")
        .replace(LINK_PATTERN, "$1")
        .replace(CODE_PATTERN, "$1")
        .replace(BOLD_PATTERN, "$1")
        .replace(ITALIC_PATTERN, "$1")
        .replace(/\s+/g, " ")
        .trim()
}

function findMarkdownParagraph(content: string): string | undefined {
    let insideFence = false
    let lines: string[] = []

    const flush = (): string | undefined => {
        const text = stripMarkdown(lines.join(" "))

        lines = []

        return text === "" ? undefined : text
    }

    for (const line of content.split("\n")) {
        if (FENCE_PATTERN.test(line)) {
            insideFence = !insideFence
            lines = []
            continue
        }

        if (insideFence) {
            continue
        }

        if (line.trim() === "" || BLOCK_PATTERN.test(line)) {
            const text = flush()

            if (text !== undefined) {
                return text
            }
            continue
        }

        lines.push(line.trim())
    }

    return flush()
}

function findTextBlock(content: string): string | undefined {
    const lines: string[] = []

    for (const line of content.split("\n")) {
        if (line.trim() === "") {
            if (lines.length > 0) {
                break
            }
            continue
        }

        lines.push(line.trim())
    }

    const text = lines.join(" ").replace(/\s+/g, " ").trim()

    return text === "" ? undefined : text
}

function truncate(text: string): string {
    if (text.length <= MAX_LENGTH) {
        return text
    }

    const limit = MAX_LENGTH - ELLIPSIS.length
    const head = text.slice(0, limit)
    const wordEnd = text[limit] === " " ? limit : head.lastIndexOf(" ")
    const cut = wordEnd > 0 ? head.slice(0, wordEnd) : head

    return `${cut.replace(TRAILING_PATTERN, "")}${ELLIPSIS}`
}

function buildDocumentDescription(
    content: string | undefined,
    format: "markdown" | "text"
): string | undefined {
    if (content === undefined) {
        return undefined
    }

    const normalized = content.replace(/\r\n?/g, "\n")
    const text = format === "text" ? findTextBlock(normalized) : findMarkdownParagraph(normalized)

    return text === undefined ? undefined : truncate(text)
}

export default buildDocumentDescription
