import { useTranslation } from "react-i18next"
import ButtonLink from "@/components/ButtonLink"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/notFound.module.css"

function NotFoundPage() {
    const localizedPath = useLocalizedPath()
    const { t } = useTranslation(["notFound", "common"])

    return (
        <>
            <title>{t("meta.title")}</title>
            <meta name="description" content={t("meta.description")} />
            <meta name="robots" content={"noindex"} />
            <div className={css.page}>
                <div className={css.content}>
                    <p className={css.label}>{t("label")}</p>
                    <h1>{t("heading")}</h1>
                    <p className={css.description}>{t("description")}</p>
                    <div className={css.actions}>
                        <ButtonLink to={localizedPath(ROUTES.projects)}>
                            {t("viewProjects")}
                        </ButtonLink>
                        <ButtonLink to={localizedPath(ROUTES.home)} variant="secondary">
                            {t("common:backHome")}
                        </ButtonLink>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NotFoundPage
