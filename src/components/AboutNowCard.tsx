import { useId } from "react"
import { useTranslation } from "react-i18next"
import ExternalButtonLink from "@/components/ExternalButtonLink"
import Icon from "@/components/Icon"
import css from "@/styles/components/aboutNowCard.module.css"
import type Profile from "@/types/profile/Profile.types"

interface AboutNowCardProps {
    profile: Profile
}

const NETWORKS = ["github", "linkedin"] as const

function getNetworkLinks(profile: Profile) {
    return NETWORKS.flatMap((network) => {
        const href = profile.links[network]
        return href ? [{ network, href }] : []
    })
}

function AboutNowCard({ profile }: AboutNowCardProps) {
    const { t } = useTranslation(["about", "common"])
    const headingId = useId()
    const networks = getNetworkLinks(profile)

    return (
        <aside className={css.card} aria-labelledby={headingId}>
            <h3 id={headingId} className={css.heading}>
                <span className={css.dot} aria-hidden="true" />
                {t("about:aboutMe.now.heading")}
            </h3>
            <dl className={css.facts}>
                <div className={css.fact}>
                    <dt className={css.term}>{t("about:aboutMe.now.role")}</dt>
                    <dd className={css.value}>{profile.role}</dd>
                </div>
                {profile.location.detail && (
                    <div className={css.fact}>
                        <dt className={css.term}>{t("about:aboutMe.now.mode")}</dt>
                        <dd className={css.value}>{profile.location.detail}</dd>
                    </div>
                )}
            </dl>
            {networks.length > 0 && (
                <ul className={css.links} aria-label={t("about:aboutMe.now.links")}>
                    {networks.map(({ network, href }) => (
                        <li key={network}>
                            <ExternalButtonLink
                                href={href}
                                variant="secondary"
                                size="sm"
                                aria-label={t(`common:footer.social.${network}Name`, {
                                    name: t("common:authorName")
                                })}
                            >
                                <Icon name={network} size={16} />
                                {t(`common:footer.social.${network}`)}
                            </ExternalButtonLink>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    )
}

export default AboutNowCard
