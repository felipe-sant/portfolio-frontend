import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import ButtonLink from "@/components/ButtonLink"
import CopyEmailButton from "@/components/CopyEmailButton"
import Icon from "@/components/Icon"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import usePageTransition from "@/hooks/usePageTransition"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import ROUTES from "@/routers/paths"
import css from "@/styles/components/footer.module.css"
import profileApi from "@/store/api/profile.api"
import type Profile from "@/types/profile/Profile.types"
import getBuildYear from "@/utils/getBuildYear"

interface FooterProps {
    variant: "default" | "navigation"
    inert?: boolean
}

interface ProfileBlockProps {
    profile?: Profile
}

interface FooterNavItemProps {
    id: (typeof FOOTER_NAV_ITEMS)[number]["id"]
    path: string
}

interface ExternalLinkProps {
    network: "github" | "linkedin"
    url: string
}

const LOCATION_SEPARATOR = " · "

const FOOTER_NAV_ITEMS = [
    { id: "home", path: ROUTES.home },
    { id: "projects", path: ROUTES.projects },
    { id: "about", path: ROUTES.about }
] as const

function IconExternalLink({ network, url }: ExternalLinkProps) {
    const { t } = useTranslation()

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={css.iconLink}
            aria-label={t(`footer.social.${network}Name`, { name: t("authorName") })}
        >
            <Icon name={network} size={20} />
        </a>
    )
}

function TextExternalLink({ network, url }: ExternalLinkProps) {
    const { t } = useTranslation()

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={css.textLink}
            aria-label={t(`footer.social.${network}Name`, { name: t("authorName") })}
        >
            <span>{t(`footer.social.${network}`)}</span>
            <span aria-hidden="true">{t("symbols.external")}</span>
        </a>
    )
}

function ContactBlock({ profile }: ProfileBlockProps) {
    const { t } = useTranslation()
    const localizedPath = useLocalizedPath()
    const location =
        profile && [profile.location.city, profile.location.region].join(LOCATION_SEPARATOR)

    return (
        <div className={css.column}>
            <p className={css.label}>{t("footer.contact.label")}</p>
            {profile && (
                <div className={css.details}>
                    <p className={css.availability}>{profile.availability.label}</p>
                    <p>{location}</p>
                    <p>{profile.contact.email}</p>
                </div>
            )}
            <div className={css.actions}>
                <ButtonLink to={localizedPath(ROUTES.contact)}>
                    {t("footer.contact.cta")}
                </ButtonLink>
                {profile && <CopyEmailButton email={profile.contact.email} />}
            </div>
            {profile && (
                <div className={css.icons}>
                    {profile.links.github && (
                        <IconExternalLink network="github" url={profile.links.github} />
                    )}
                    {profile.links.linkedin && (
                        <IconExternalLink network="linkedin" url={profile.links.linkedin} />
                    )}
                    <a
                        href={`mailto:${profile.contact.email}`}
                        className={css.iconLink}
                        aria-label={t("footer.social.emailName", { name: t("authorName") })}
                    >
                        <Icon name="mail" size={20} />
                    </a>
                </div>
            )}
        </div>
    )
}

function FooterNavItem({ id, path }: FooterNavItemProps) {
    const { t } = useTranslation()
    const localizedPath = useLocalizedPath()
    const viewTransition = usePageTransition()

    return (
        <li>
            <Link to={localizedPath(path)} viewTransition={viewTransition} className={css.textLink}>
                {t(`navigation.${id}`)}
            </Link>
        </li>
    )
}

function NavigationBlock({ profile }: ProfileBlockProps) {
    const { t } = useTranslation()

    return (
        <>
            <div className={css.column}>
                <p className={css.label}>{t("footer.navigation.heading")}</p>
                <nav aria-label={t("footer.navigation.label")}>
                    <ul className={css.list}>
                        {FOOTER_NAV_ITEMS.map((item) => (
                            <FooterNavItem key={item.id} id={item.id} path={item.path} />
                        ))}
                    </ul>
                </nav>
            </div>
            <div className={css.column}>
                <p className={css.label}>{t("footer.social.heading")}</p>
                <ul className={css.list}>
                    {profile?.links.github && (
                        <li>
                            <TextExternalLink network="github" url={profile.links.github} />
                        </li>
                    )}
                    {profile?.links.linkedin && (
                        <li>
                            <TextExternalLink network="linkedin" url={profile.links.linkedin} />
                        </li>
                    )}
                    <li>
                        <button
                            type="button"
                            disabled
                            className={css.resume}
                            aria-label={t("footer.resumeName")}
                        >
                            <span aria-hidden="true">{t("footer.resume")}</span>
                            <span aria-hidden="true">{t("symbols.download")}</span>
                        </button>
                    </li>
                </ul>
            </div>
        </>
    )
}

function BottomBar() {
    const { t } = useTranslation()

    return (
        <div className={css.bottom}>
            <div className={css.bottomInner}>
                <p>{t("footer.copyright", { year: getBuildYear(), name: t("authorName") })}</p>
                <p>{t("footer.madeWith")}</p>
            </div>
        </div>
    )
}

function Footer({ variant, inert }: FooterProps) {
    const { i18n } = useTranslation()
    const lang = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
    const { data: profile } = profileApi.useGetProfileQuery({ lang })

    return (
        <footer className={css.footer} inert={inert}>
            <div className={css.inner}>
                {variant === "navigation" ? (
                    <NavigationBlock profile={profile} />
                ) : (
                    <ContactBlock profile={profile} />
                )}
            </div>
            <BottomBar />
        </footer>
    )
}

export default Footer
