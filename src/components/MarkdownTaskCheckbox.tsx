import type { ComponentPropsWithoutRef } from "react"
import type { ExtraProps } from "react-markdown"
import { useTranslation } from "react-i18next"

function MarkdownTaskCheckbox({ checked }: ComponentPropsWithoutRef<"input"> & ExtraProps) {
    const { t } = useTranslation("project")

    return (
        <input
            type="checkbox"
            checked={Boolean(checked)}
            disabled
            aria-label={checked ? t("markdown.taskDone") : t("markdown.taskTodo")}
        />
    )
}

export default MarkdownTaskCheckbox
