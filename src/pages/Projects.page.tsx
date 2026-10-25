import { useTranslation } from "react-i18next"

function ProjectsPage() {
    const { t } = useTranslation("projects")

    return (
        <>
            <h1>{t("heading")}</h1>
            <p>{t("intro")}</p>
        </>
    )
}

export default ProjectsPage
