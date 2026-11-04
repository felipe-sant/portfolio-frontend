import { useTranslation } from "react-i18next"
import ExternalButtonLink from "@/components/ExternalButtonLink"
import css from "@/styles/components/projectLinks.module.css"

interface ProjectLinksProps {
    title: string
    demoUrl?: string
    repositoryUrl?: string
}

function ProjectLinks({ title, demoUrl, repositoryUrl }: ProjectLinksProps) {
    const { t } = useTranslation("project")

    if (!demoUrl && !repositoryUrl) {
        return null
    }

    return (
        <div className={css.links}>
            {demoUrl && (
                <ExternalButtonLink
                    href={demoUrl}
                    variant="primary"
                    aria-label={t("links.demoName", { project: title })}
                >
                    {t("links.demo")}
                </ExternalButtonLink>
            )}
            {repositoryUrl && (
                <ExternalButtonLink
                    href={repositoryUrl}
                    variant={demoUrl ? "secondary" : "primary"}
                    aria-label={t("links.codeName", { project: title })}
                >
                    {t("links.code")}
                </ExternalButtonLink>
            )}
        </div>
    )
}

export default ProjectLinks
