import { useTranslation } from "react-i18next"
import Button from "@/components/Button"
import ButtonLink from "@/components/ButtonLink"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import Icon from "@/components/Icon"
import SkipLink from "@/components/SkipLink"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import useMobileMenu from "@/hooks/useMobileMenu"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/error.module.css"
import reloadPage from "@/utils/reloadPage"

const MAIN_ID = "main-content"

function ErrorPage() {
    const localizedPath = useLocalizedPath()
    const menu = useMobileMenu()
    const { t } = useTranslation(["error", "common"])

    return (
        <div className={css.layout}>
            <title>{t("meta.title")}</title>
            <meta name="description" content={t("meta.description")} />
            <meta name="robots" content={"noindex"} />
            <SkipLink targetId={MAIN_ID} inert={menu.isOpen} />
            <Header menu={menu} />
            <main id={MAIN_ID} tabIndex={-1} className={css.main} inert={menu.isOpen}>
                <div className={css.content}>
                    <span className={css.icon}>
                        <Icon name="alert" size={20} />
                    </span>
                    <h1>{t("heading")}</h1>
                    <p className={css.description}>{t("description")}</p>
                    <div className={css.actions}>
                        <Button onClick={reloadPage}>{t("retry")}</Button>
                        <ButtonLink to={localizedPath(ROUTES.home)} variant="secondary">
                            {t("common:backHome")}
                        </ButtonLink>
                    </div>
                </div>
            </main>
            <Footer variant="default" inert={menu.isOpen} />
        </div>
    )
}

export default ErrorPage
