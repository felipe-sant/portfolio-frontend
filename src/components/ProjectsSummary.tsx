import { useTranslation } from "react-i18next"
import Button from "@/components/Button"
import css from "@/styles/components/projectsSummary.module.css"

interface ProjectsSummaryProps {
    text: string
    canClear: boolean
    onClear: () => void
}

function ProjectsSummary({ text, canClear, onClear }: ProjectsSummaryProps) {
    const { t } = useTranslation("projects")

    return (
        <div className={css.summary}>
            <p role={"status"} className={css.count}>
                {text}
            </p>
            {canClear && (
                <Button variant="ghost" onClick={onClear}>
                    {t("results.clearFilters")}
                </Button>
            )}
        </div>
    )
}

export default ProjectsSummary
