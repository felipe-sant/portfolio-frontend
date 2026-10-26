import type { ComponentPropsWithoutRef } from "react"
import ReactMarkdown from "react-markdown"
import type { ExtraProps } from "react-markdown"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import css from "@/styles/components/markdownDocument.module.css"
import isAllowedMarkdownUrl from "@/utils/isAllowedMarkdownUrl"

interface MarkdownDocumentProps {
    content: string
}

const DISALLOWED_ELEMENTS = ["img", "sup", "section"]

function MarkdownAnchor({ href, children }: ComponentPropsWithoutRef<"a">) {
    return href ? <a href={href}>{children}</a> : <>{children}</>
}

function createHeading(Tag: "h3" | "h4" | "h5" | "h6") {
    return function Heading({ id, children }: ComponentPropsWithoutRef<"h2"> & ExtraProps) {
        return <Tag id={id}>{children}</Tag>
    }
}

const COMPONENTS = {
    a: MarkdownAnchor,
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
                rehypePlugins={[rehypeSlug]}
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
