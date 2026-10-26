import type { ComponentPropsWithoutRef } from "react"
import ReactMarkdown from "react-markdown"
import type { ExtraProps } from "react-markdown"
import MarkdownCodeBlock from "@/components/MarkdownCodeBlock"
import MarkdownInlineCode from "@/components/MarkdownInlineCode"
import MarkdownLink from "@/components/MarkdownLink"
import MarkdownTable from "@/components/MarkdownTable"
import MarkdownTableHeaderCell from "@/components/MarkdownTableHeaderCell"
import MarkdownTaskCheckbox from "@/components/MarkdownTaskCheckbox"
import MarkdownToken from "@/components/MarkdownToken"
import rehypeHighlight from "rehype-highlight"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import css from "@/styles/components/markdownDocument.module.css"
import rehypeNumberTables from "@/utils/rehypeNumberTables"
import CODE_LANGUAGE_ALIASES from "@/utils/codeLanguageAliases"
import CODE_LANGUAGES from "@/utils/codeLanguages"
import isAllowedMarkdownUrl from "@/utils/isAllowedMarkdownUrl"

interface MarkdownDocumentProps {
    content: string
}

const HIGHLIGHT_OPTIONS = {
    languages: CODE_LANGUAGES,
    aliases: CODE_LANGUAGE_ALIASES,
    plainText: ["mermaid"]
}

const DISALLOWED_ELEMENTS = ["img", "sup", "section"]

function createHeading(Tag: "h3" | "h4" | "h5" | "h6") {
    return function Heading({ id, children }: ComponentPropsWithoutRef<"h2"> & ExtraProps) {
        return <Tag id={id}>{children}</Tag>
    }
}

const COMPONENTS = {
    a: MarkdownLink,
    pre: MarkdownCodeBlock,
    table: MarkdownTable,
    th: MarkdownTableHeaderCell,
    input: MarkdownTaskCheckbox,
    code: MarkdownInlineCode,
    span: MarkdownToken,
    h1: createHeading("h3"),
    h2: createHeading("h3"),
    h3: createHeading("h4"),
    h4: createHeading("h5"),
    h5: createHeading("h6"),
    h6: createHeading("h6")
}

function transformUrl(url: string): string {
    return isAllowedMarkdownUrl(url) ? url : ""
}

function MarkdownDocument({ content }: MarkdownDocumentProps) {
    return (
        <div className={css.document}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    rehypeNumberTables,
                    rehypeSlug,
                    [rehypeHighlight, HIGHLIGHT_OPTIONS]
                ]}
                skipHtml
                disallowedElements={DISALLOWED_ELEMENTS}
                urlTransform={transformUrl}
                components={COMPONENTS}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}

export default MarkdownDocument
