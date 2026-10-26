import type { ComponentPropsWithoutRef } from "react"
import ReactMarkdown from "react-markdown"
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

function transformUrl(url: string): string {
    return isAllowedMarkdownUrl(url) ? url : ""
}

function MarkdownDocument({ content }: MarkdownDocumentProps) {
    return (
        <div className={css.document}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                skipHtml
                disallowedElements={DISALLOWED_ELEMENTS}
                urlTransform={transformUrl}
                components={{ a: MarkdownAnchor }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}

export default MarkdownDocument
