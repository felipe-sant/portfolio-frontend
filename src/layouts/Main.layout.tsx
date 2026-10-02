import { Suspense } from "react"
import { useTranslation } from "react-i18next"
import { Link, Outlet } from "react-router-dom"
import ROUTES from "@/routers/paths"
import css from "@/styles/layouts/main.module.css"

function MainLayout() {
    const { t } = useTranslation(["mainLayout", "common"])

    return (
        <div className={css.layout}>
            <header className={css.header}>
                <Link to={ROUTES.home}>{t("brand")}</Link>
            </header>
            <div className={css.content}>
                <Suspense fallback={<p>{t("common:loading")}</p>}>
                    <Outlet />
                </Suspense>
            </div>
            <footer className={css.footer}>
                <p>{t("copyright")}</p>
            </footer>
        </div>
    )
}

export default MainLayout
