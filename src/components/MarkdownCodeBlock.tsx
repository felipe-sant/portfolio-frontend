import { useId } from "react"
import type { ComponentPropsWithoutRef } from "react"
import type { ExtraProps } from "react-markdown"
import { useTranslation } from "react-i18next"
import MarkdownCodeContext from "@/components/MarkdownCodeContext"
import css from "@/styles/components/markdownCodeBlock.module.css"
import parseCodeFenceTitle from "@/utils/parseCodeFenceTitle"
import resolveCodeLanguage from "@/utils/resolveCodeLanguage"

const LANGUAGE_PREFIX = "language-"

function MarkdownCodeBlock({ node, children }: ComponentPropsWithoutRef<"pre"> & ExtraProps) {
    const { t } = useTranslation("project")
    const headerId = useId()
    const codeElement = node?.children[0]
    const code = codeElement?.type === "element" ? codeElement : undefined
    const classNames = code?.properties.className
    const languageName = Array.isArray(classNames)
        ? classNames
              .map(String)
              .find((name) => name.startsWith(LANGUAGE_PREFIX))
              ?.slice(LANGUAGE_PREFIX.length)
        : undefined
    const language = resolveCodeLanguage(languageName)
    const languageLabel = language ? t(`codeBlock.language.${language}`) : languageName
    const file = parseCodeFenceTitle(code?.data?.meta)
    const hasHeader = Boolean(file || languageLabel)
    const index = node?.properties.dataCodeBlockIndex
    const baseLabel = [file, languageLabel].filter(Boolean).join(" ") || t("codeBlock.label")
    const numberedLabel = index === undefined ? undefined : `${baseLabel} ${index}`

    return (
        <div className={css.block}>
            {hasHeader && (
                <div id={headerId} className={css.header}>
                    <span className={css.file}>{file}</span>
                    <span className={css.language}>{languageLabel}</span>
                </div>
            )}
            <pre
                className={css.body}
                role={"region"}
                tabIndex={0}
                aria-labelledby={hasHeader && !numberedLabel ? headerId : undefined}
                aria-label={numberedLabel ?? (hasHeader ? undefined : t("codeBlock.label"))}
            >
                <MarkdownCodeContext.Provider value>{children}</MarkdownCodeContext.Provider>
            </pre>
        </div>
    )
}

export default MarkdownCodeBlock
