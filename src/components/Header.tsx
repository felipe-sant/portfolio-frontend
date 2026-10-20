import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import CatLogo from "@/components/CatLogo"
import IconButton from "@/components/IconButton"
import LanguageSelector from "@/components/LanguageSelector"
import ThemeToggle from "@/components/ThemeToggle"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import ROUTES from "@/routers/paths"
import css from "@/styles/components/header.module.css"
import type MobileMenu from "@/types/navigation/MobileMenu.types"
import type NavItemId from "@/types/navigation/NavItemId.types"

interface HeaderProps {
    menu: MobileMenu
    activeItem?: NavItemId
}

interface NavLinksProps {
    activeItem?: NavItemId
    onNavigate?: () => void
    className: string
}

const NAV_ITEMS = [
    { id: "home", path: ROUTES.home },
    { id: "projects", path: ROUTES.projects },
    { id: "about", path: ROUTES.about },
    { id: "contact", path: ROUTES.contact }
] as const

function NavLinks({ activeItem, onNavigate, className }: NavLinksProps) {
    const { t } = useTranslation()
    const localizedPath = useLocalizedPath()

    return (
        <nav aria-label={t("navigation.label")} className={className}>
            {NAV_ITEMS.map((item) => (
                <Link
                    key={item.id}
                    to={localizedPath(item.path)}
                    className={css.link}
                    aria-current={item.id === activeItem ? "page" : undefined}
                    onClick={onNavigate}
                >
                    {t(`navigation.${item.id}`)}
                </Link>
            ))}
        </nav>
    )
}

function Header({ menu, activeItem }: HeaderProps) {
    const { t } = useTranslation()
    const localizedPath = useLocalizedPath()
    const { isOpen, panelId, buttonRef, panelRef, toggle, close } = menu

    return (
        <header className={css.header}>
            <div className={css.bar}>
                <Link to={localizedPath(ROUTES.home)} className={css.brand} inert={isOpen}>
                    <CatLogo />
                    <span>{t("authorName")}</span>
                </Link>
                <NavLinks activeItem={activeItem} className={css.desktopNav} />
                <div className={css.desktopControls}>
                    <LanguageSelector />
                    <ThemeToggle />
                </div>
                <div className={css.menuToggle}>
                    <IconButton
                        ref={buttonRef}
                        icon={isOpen ? "close" : "menu"}
                        label={t("menu.toggle")}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={toggle}
                    />
                </div>
            </div>
            <div id={panelId} ref={panelRef} className={css.panel} hidden={!isOpen}>
                <NavLinks activeItem={activeItem} onNavigate={close} className={css.panelNav} />
                <div className={css.group}>
                    <p className={css.label}>{t("languageSelector.label")}</p>
                    <LanguageSelector variant="block" />
                </div>
                <div className={css.group}>
                    <p className={css.label}>{t("menu.theme")}</p>
                    <ThemeToggle variant="labeled" />
                </div>
            </div>
        </header>
    )
}

export default Header
