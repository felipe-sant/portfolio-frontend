import { useTranslation } from "react-i18next"
import AboutAsync from "@/components/AboutAsync"
import AvailabilityBadge from "@/components/AvailabilityBadge"
import ButtonLink from "@/components/ButtonLink"
import Icon from "@/components/Icon"
import ProfilePhoto from "@/components/ProfilePhoto"
import ResumeLink from "@/components/ResumeLink"
import Skeleton from "@/components/Skeleton"
import SkeletonSwap from "@/components/SkeletonSwap"
import css from "@/styles/components/aboutHero.module.css"
import type AboutProfileState from "@/types/about/AboutProfileState.types"

interface AboutHeroProps {
    profile: AboutProfileState
    headingId: string
    alertId: string
    updatedLabel: string | undefined
    contactPath: string
    resumeHref: string
    onOpenResume: (element: HTMLElement) => void
}

function AboutHero({
    profile,
    headingId,
    alertId,
    updatedLabel,
    contactPath,
    resumeHref,
    onOpenResume
}: AboutHeroProps) {
    const { t } = useTranslation(["about", "common"])
    const data = profile.data
    const location =
        data &&
        [data.location.city, data.location.region].join(` ${t("common:symbols.separator")} `)

    return (
        <section className={css.hero} aria-labelledby={headingId}>
            <div className={css.container}>
                <div className={css.grid}>
                    <div className={css.photoColumn}>
                        <SkeletonSwap
                            isLoading={profile.isLoading}
                            skeleton={<Skeleton shape="photo" />}
                        >
                            <ProfilePhoto photo={data?.photo} />
                        </SkeletonSwap>
                        <div className={css.facts}>
                            <AboutAsync
                                isLoading={profile.isLoading}
                                isError={profile.isError}
                                onRetry={profile.retry}
                                errorId={alertId}
                                announce
                                skeleton={
                                    <div className={css.factsSkeleton}>
                                        <Skeleton width="medium" />
                                        <Skeleton shape="title" width="medium" />
                                    </div>
                                }
                            >
                                {data && (
                                    <>
                                        <p className={css.location}>
                                            <Icon name="pin" size={16} />
                                            {location}
                                        </p>
                                        {data.availability.isAvailable && (
                                            <AvailabilityBadge label={data.availability.label} />
                                        )}
                                    </>
                                )}
                            </AboutAsync>
                        </div>
                    </div>
                    <div className={css.text}>
                        <p className={css.label}>{t("about:hero.label")}</p>
                        <h1 id={headingId} tabIndex={-1} className={css.heading}>
                            {t("common:authorName")}
                        </h1>
                        <AboutAsync
                            isLoading={profile.isLoading}
                            isError={profile.isError}
                            onRetry={profile.retry}
                            skeleton={
                                <div className={css.textSkeleton}>
                                    <Skeleton />
                                    <Skeleton />
                                    <Skeleton width="medium" />
                                </div>
                            }
                        >
                            {data && (
                                <>
                                    <p className={css.summary}>{data.summary}</p>
                                    {updatedLabel && (
                                        <p className={css.updated}>
                                            {t("about:updatedAt", { date: updatedLabel })}
                                        </p>
                                    )}
                                </>
                            )}
                        </AboutAsync>
                        <div className={css.actions}>
                            <ResumeLink
                                href={resumeHref}
                                onOpen={onOpenResume}
                                variant="primary"
                                size="lg"
                                aria-label={t("common:resume.downloadPdf")}
                            >
                                <Icon name="download" />
                                {t("common:resume.download")}
                            </ResumeLink>
                            <ButtonLink to={contactPath} variant="secondary" size="lg">
                                {t("common:footer.contact.cta")}
                            </ButtonLink>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutHero
