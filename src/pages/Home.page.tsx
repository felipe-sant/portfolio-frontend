import { useTranslation } from "react-i18next"
import css from "@/styles/pages/home.module.css"

function HomePage() {
    const { t } = useTranslation("home")

    return (
        <>
            <title>{t("meta.title")}</title>
            <meta name="description" content={t("meta.description")} />
            <main className={css.main}>
                <h1>{t("heading")}</h1>
                <p className={css.intro}>{t("intro")}</p>
            </main>
        </>
    )
}

export default HomePage
