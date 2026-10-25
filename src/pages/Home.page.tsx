import JsonLd from "@/components/JsonLd"
import PageMeta from "@/components/PageMeta"
import useHome from "@/pages/hooks/useHome"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/home.module.css"

function HomePage() {
    const { t, jsonLd } = useHome()

    return (
        <>
            <title>{t("home:meta.title")}</title>
            <meta name="description" content={t("home:meta.description")} />
            <PageMeta
                title={t("home:meta.title")}
                description={t("home:meta.description")}
                path={ROUTES.home}
            />
            <JsonLd data={jsonLd} />
            <div className={css.main}>
                <h1>{t("home:heading")}</h1>
                <p className={css.intro}>{t("home:intro")}</p>
            </div>
        </>
    )
}

export default HomePage
