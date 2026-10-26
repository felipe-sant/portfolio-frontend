import type { ComponentPropsWithoutRef } from "react"
import type { ExtraProps } from "react-markdown"
import { useTranslation } from "react-i18next"
import css from "@/styles/components/markdownTable.module.css"

function MarkdownTable({ node, children }: ComponentPropsWithoutRef<"table"> & ExtraProps) {
    const { t } = useTranslation("project")
    const index = node?.properties.dataTableIndex

    return (
        <div
            className={css.container}
            role={"region"}
            tabIndex={0}
            aria-label={t("markdown.table", { index })}
        >
            <table className={css.table}>{children}</table>
        </div>
    )
}

export default MarkdownTable
