import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import usePageTransition from "@/hooks/usePageTransition"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/notFound.module.css"

function NotFoundPage() {
    const localizedPath = useLocalizedPath()
    const viewTransition = usePageTransition()
    const { t } = useTranslation(["notFound", "common"])

    return (
        <>
            <title>{t("meta.title")}</title>
            <meta name="description" content={t("meta.description")} />
            <div className={css.main}>
                <div>
                    <h1>{t("heading")}</h1>
                    <p>
                        <Link to={localizedPath(ROUTES.home)} viewTransition={viewTransition}>
                            {t("common:backHome")}
                        </Link>
                    </p>
                </div>
            </div>
        </>
    )
}

export default NotFoundPage
