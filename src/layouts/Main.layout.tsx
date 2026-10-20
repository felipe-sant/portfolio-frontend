import { Suspense, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom"
import Header from "@/components/Header"
import SkipLink from "@/components/SkipLink"
import VisuallyHidden from "@/components/VisuallyHidden"
import useMobileMenu from "@/hooks/useMobileMenu"
import useRouteFocus from "@/hooks/useRouteFocus"
import getLanguageFromPath from "@/i18n/getLanguageFromPath"
import stripLanguagePrefix from "@/i18n/stripLanguagePrefix"
import css from "@/styles/layouts/main.module.css"
import getActiveNavItem from "@/utils/getActiveNavItem"

const MAIN_ID = "main-content"

function MainLayout() {
    const { t } = useTranslation(["mainLayout", "common"])
    const { pathname } = useLocation()
    const menu = useMobileMenu()
    const mainRef = useRef<HTMLElement>(null)
    useRouteFocus(mainRef)

    const activeItem = getLanguageFromPath(pathname)
        ? getActiveNavItem(stripLanguagePrefix(pathname))
        : undefined

    return (
        <div className={css.layout}>
            <SkipLink targetId={MAIN_ID} inert={menu.isOpen} />
            <Header menu={menu} activeItem={activeItem} />
            <main
                id={MAIN_ID}
                ref={mainRef}
                tabIndex={-1}
                className={css.content}
                inert={menu.isOpen}
            >
                <Suspense
                    fallback={
                        <VisuallyHidden role={"status"}>{t("common:loading")}</VisuallyHidden>
                    }
                >
                    <Outlet />
                </Suspense>
            </main>
            <footer className={css.footer} inert={menu.isOpen}>
                <p>{t("copyright")}</p>
            </footer>
            <ScrollRestoration />
        </div>
    )
}

export default MainLayout
