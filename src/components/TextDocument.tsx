import css from "@/styles/components/textDocument.module.css"

interface TextDocumentProps {
    content: string
    labelledBy: string
    lang?: string
}

function TextDocument({ content, labelledBy, lang }: TextDocumentProps) {
    return (
        <pre
            className={css.text}
            role={"region"}
            tabIndex={0}
            aria-labelledby={labelledBy}
            lang={lang}
        >
            {content}
        </pre>
    )
}

export default TextDocument
