import { Suspense } from "react"
import { useTranslation } from "react-i18next"
import { Outlet } from "react-router-dom"
import css from "@/styles/layouts/main.module.css"

function MainLayout() {
    const { t } = useTranslation(["mainLayout", "common"])

    return (
        <div className={css.layout}>
            <header className={css.header}>
                <span>{t("header")}</span>
            </header>
            <div className={css.content}>
                <Suspense fallback={<p>{t("common:loading")}</p>}>
                    <Outlet />
                </Suspense>
            </div>
            <footer className={css.footer}>
                <span>{t("footer")}</span>
            </footer>
        </div>
    )
}

export default MainLayout
