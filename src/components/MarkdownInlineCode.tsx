import { useContext } from "react"
import type { ComponentPropsWithoutRef } from "react"
import type { ExtraProps } from "react-markdown"
import MarkdownCodeContext from "@/components/MarkdownCodeContext"
import css from "@/styles/components/markdownCodeBlock.module.css"

function MarkdownInlineCode({
    className,
    children
}: ComponentPropsWithoutRef<"code"> & ExtraProps) {
    const isBlock = useContext(MarkdownCodeContext)

    return <code className={isBlock ? className : css.inline}>{children}</code>
}

export default MarkdownInlineCode
