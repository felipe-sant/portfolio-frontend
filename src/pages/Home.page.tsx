import { Trans, useTranslation } from "react-i18next"
import css from "@/styles/pages/home.module.css"

function HomePage() {
    const { t } = useTranslation("home")

    return (
        <>
            <title>{t("meta.title")}</title>
            <meta name="description" content={t("meta.description")} />
            <main className={css.main}>
                <h1>{t("heading")}</h1>
                <section className={css.showcase}>
                    <p className={css.label}>{t("showcase.label")}</p>
                    <p className={css.description}>
                        <Trans
                            t={t}
                            i18nKey="showcase.description"
                            components={{ strong: <strong /> }}
                        />
                    </p>
                    <p className={css.caption}>{t("showcase.caption")}</p>
                    <div className={css.chips}>
                        <span className={`${css.chip} ${css.chipSuccess}`}>
                            {t("showcase.status.success")}
                        </span>
                        <span className={`${css.chip} ${css.chipWarning}`}>
                            {t("showcase.status.warning")}
                        </span>
                        <span className={`${css.chip} ${css.chipError}`}>
                            {t("showcase.status.error")}
                        </span>
                    </div>
                </section>
            </main>
        </>
    )
}

export default HomePage
