import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import { unified } from "unified"
import type { Root } from "mdast"

function parseMarkdown(text: string): Root {
    return unified().use(remarkParse).use(remarkGfm).parse(text)
}

export default parseMarkdown
