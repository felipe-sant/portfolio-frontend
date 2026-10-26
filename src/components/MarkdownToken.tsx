import type { ComponentPropsWithoutRef } from "react"
import type { ExtraProps } from "react-markdown"
import css from "@/styles/components/markdownCodeBlock.module.css"

const TOKEN_CLASSES: Record<string, string> = {
    comment: "comment",
    quote: "comment",
    keyword: "keyword",
    literal: "keyword",
    "selector-tag": "keyword",
    doctag: "keyword",
    string: "string",
    regexp: "string",
    symbol: "string",
    number: "number",
    title: "function",
    section: "function",
    type: "type",
    built_in: "type",
    attr: "type",
    attribute: "type",
    variable: "type"
}

function readTokenClass(className: string | undefined): string | undefined {
    const names = className?.split(" ") ?? []
    const token = names.find((name) => name.startsWith("hljs-"))?.slice("hljs-".length)

    if (!token) {
        return undefined
    }

    if (token === "title" && names.includes("class_")) {
        return css.type
    }

    const key = TOKEN_CLASSES[token]

    return key ? css[key] : undefined
}

function MarkdownToken({ className, children }: ComponentPropsWithoutRef<"span"> & ExtraProps) {
    return <span className={readTokenClass(className)}>{children}</span>
}

export default MarkdownToken
