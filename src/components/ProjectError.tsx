import { useTranslation } from "react-i18next"
import Button from "@/components/Button"
import ButtonLink from "@/components/ButtonLink"
import Icon from "@/components/Icon"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import ROUTES from "@/routers/paths"
import css from "@/styles/components/projectError.module.css"

interface ProjectErrorProps {
    onRetry: () => void
}

function ProjectError({ onRetry }: ProjectErrorProps) {
    const { t } = useTranslation("project")
    const localizedPath = useLocalizedPath()

    return (
        <div className={css.error} role={"alert"}>
            <Icon name="alert" size={20} />
            <h1 className={css.heading} tabIndex={-1}>
                {t("loadError.heading")}
            </h1>
            <p className={css.description}>{t("loadError.description")}</p>
            <div className={css.actions}>
                <Button variant="secondary" onClick={onRetry}>
                    {t("retry")}
                </Button>
                <ButtonLink variant="secondary" to={localizedPath(ROUTES.projects)}>
                    {t("loadError.otherProjects")}
                </ButtonLink>
            </div>
        </div>
    )
}

export default ProjectError
