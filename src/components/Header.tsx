import type { ReactNode, Ref } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import CatLogo from "@/components/CatLogo"
import IconButton from "@/components/IconButton"
import LanguageSelector from "@/components/LanguageSelector"
import MotionToggle from "@/components/MotionToggle"
import SettingsMenu from "@/components/SettingsMenu"
import ThemeToggle from "@/components/ThemeToggle"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import useNavIndicator from "@/hooks/useNavIndicator"
import usePageTransition from "@/hooks/usePageTransition"
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
    navRef?: Ref<HTMLElement>
    children?: ReactNode
}

interface NavLinkItemProps {
    id: NavItemId
    to: string
    isActive: boolean
    onNavigate?: () => void
}

interface DesktopNavProps {
    activeItem?: NavItemId
}

const NAV_ITEMS = [
    { id: "home", path: ROUTES.home },
    { id: "projects", path: ROUTES.projects },
    { id: "about", path: ROUTES.about },
    { id: "contact", path: ROUTES.contact }
] as const

function NavLinkItem({ id, to, isActive, onNavigate }: NavLinkItemProps) {
    const { t } = useTranslation()
    const viewTransition = usePageTransition()

    return (
        <Link
            to={to}
            viewTransition={viewTransition}
            className={css.link}
            aria-current={isActive ? "page" : undefined}
            onClick={onNavigate}
        >
            {t(`navigation.${id}`)}
        </Link>
    )
}

function NavLinks({ activeItem, onNavigate, className, navRef, children }: NavLinksProps) {
    const { t } = useTranslation()
    const localizedPath = useLocalizedPath()

    return (
        <nav aria-label={t("navigation.label")} className={className} ref={navRef}>
            {NAV_ITEMS.map((item) => (
                <NavLinkItem
                    key={item.id}
                    id={item.id}
                    to={localizedPath(item.path)}
                    isActive={item.id === activeItem}
                    onNavigate={onNavigate}
                />
            ))}
            {children}
        </nav>
    )
}

function DesktopNav({ activeItem }: DesktopNavProps) {
    const { navRef, indicatorStyle, isAnimated } = useNavIndicator()

    return (
        <NavLinks activeItem={activeItem} className={css.desktopNav} navRef={navRef}>
            <span
                aria-hidden="true"
                className={`${css.indicator} ${isAnimated ? css.indicatorAnimated : ""}`}
                style={indicatorStyle}
            />
        </NavLinks>
    )
}

function Header({ menu, activeItem }: HeaderProps) {
    const { t } = useTranslation()
    const localizedPath = useLocalizedPath()
    const viewTransition = usePageTransition()
    const { isOpen, panelId, buttonRef, panelRef, toggle, close } = menu

    return (
        <header className={css.header}>
            <div className={css.bar}>
                <Link
                    to={localizedPath(ROUTES.home)}
                    viewTransition={viewTransition}
                    className={css.brand}
                    inert={isOpen}
                >
                    <CatLogo />
                    <span>{t("authorName")}</span>
                </Link>
                <DesktopNav activeItem={activeItem} />
                <div className={css.desktopControls}>
                    <LanguageSelector />
                    <SettingsMenu />
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
                <div className={css.group}>
                    <p className={css.label}>{t("menu.accessibility")}</p>
                    <MotionToggle variant="labeled" />
                </div>
            </div>
        </header>
    )
}

export default Header
