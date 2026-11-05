import { useTranslation } from "react-i18next"
import AboutNowCard from "@/components/AboutNowCard"
import AvailabilityBadge from "@/components/AvailabilityBadge"
import ButtonLink from "@/components/ButtonLink"
import CertificateChip from "@/components/CertificateChip"
import Chip from "@/components/Chip"
import Icon from "@/components/Icon"
import JsonLd from "@/components/JsonLd"
import LoadError from "@/components/LoadError"
import PageMeta from "@/components/PageMeta"
import ProfilePhoto from "@/components/ProfilePhoto"
import ResumeLink from "@/components/ResumeLink"
import ResumeModal from "@/components/ResumeModal"
import Reveal from "@/components/Reveal"
import Skeleton from "@/components/Skeleton"
import SkeletonSwap from "@/components/SkeletonSwap"
import StackGroupList from "@/components/StackGroupList"
import TrajectoryGroup from "@/components/TrajectoryGroup"
import TrajectoryModal from "@/components/TrajectoryModal"
import VisuallyHidden from "@/components/VisuallyHidden"
import useAbout from "@/pages/hooks/useAbout"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/about.module.css"

interface PartErrorProps {
    announce: boolean
    id?: string
    onRetry: () => void
}

function PartError({ announce, id, onRetry }: PartErrorProps) {
    const { t } = useTranslation("about")

    return (
        <LoadError
            id={id}
            announce={announce}
            title={t("loadError.message")}
            retryLabel={t("loadError.retry")}
            onRetry={onRetry}
        />
    )
}

function ChipsSkeleton() {
    return (
        <div className={css.chipsSkeleton}>
            <Skeleton shape="title" width="short" />
            <Skeleton shape="title" width="short" />
            <Skeleton shape="title" width="short" />
        </div>
    )
}

function AboutPage() {
    const {
        t,
        jsonLd,
        isLoading,
        paths,
        resume,
        ids,
        profile,
        timeline,
        stackGroups,
        workPrinciples,
        show,
        selectedItem,
        open,
        close,
        registerTrigger
    } = useAbout()
    const data = profile.data
    const complementsLabelledBy = [
        show.certificates && "about-certificates-heading",
        show.workStyle && "about-work-style-heading"
    ]
        .filter(Boolean)
        .join(" ")
    const location =
        data &&
        [data.location.city, data.location.region].join(` ${t("common:symbols.separator")} `)

    return (
        <>
            <title>{t("about:meta.title")}</title>
            <meta name="description" content={t("about:meta.description")} />
            <PageMeta
                title={t("about:meta.title")}
                description={t("about:meta.description")}
                path={ROUTES.about}
                type="profile"
            />
            <JsonLd data={jsonLd} />
            {isLoading && <VisuallyHidden role={"status"}>{t("common:loading")}</VisuallyHidden>}
            <section className={css.hero} aria-labelledby={ids.profileHeading}>
                <div className={css.container}>
                    <div className={css.heroGrid}>
                        <div className={css.photoColumn}>
                            <SkeletonSwap
                                isLoading={profile.isLoading}
                                skeleton={<Skeleton shape="photo" />}
                            >
                                <ProfilePhoto photo={data?.photo} />
                            </SkeletonSwap>
                            <div className={css.facts}>
                                <SkeletonSwap
                                    isLoading={profile.isLoading}
                                    skeleton={
                                        <div className={css.factsSkeleton}>
                                            <Skeleton width="medium" />
                                            <Skeleton shape="title" width="medium" />
                                        </div>
                                    }
                                >
                                    {profile.isError && (
                                        <PartError
                                            announce
                                            id={ids.profileAlert}
                                            onRetry={profile.retry}
                                        />
                                    )}
                                    {data && (
                                        <>
                                            <p className={css.location}>
                                                <Icon name="pin" size={16} />
                                                {location}
                                            </p>
                                            {data.availability.isAvailable && (
                                                <AvailabilityBadge
                                                    label={data.availability.label}
                                                />
                                            )}
                                        </>
                                    )}
                                </SkeletonSwap>
                            </div>
                        </div>
                        <div className={css.heroText}>
                            <p className={css.label}>{t("about:hero.label")}</p>
                            <h1 id={ids.profileHeading} tabIndex={-1} className={css.heading}>
                                {t("common:authorName")}
                            </h1>
                            <SkeletonSwap
                                isLoading={profile.isLoading}
                                skeleton={
                                    <div className={css.textSkeleton}>
                                        <Skeleton />
                                        <Skeleton />
                                        <Skeleton width="medium" />
                                    </div>
                                }
                            >
                                {profile.isError && (
                                    <PartError announce={false} onRetry={profile.retry} />
                                )}
                                {data && <p className={css.summary}>{data.summary}</p>}
                            </SkeletonSwap>
                            <div className={css.actions}>
                                <ResumeLink
                                    href={resume.href}
                                    onOpen={resume.open}
                                    variant="primary"
                                    size="lg"
                                    aria-label={t("common:resume.downloadPdf")}
                                >
                                    <Icon name="download" />
                                    {t("common:resume.download")}
                                </ResumeLink>
                                <ButtonLink to={paths.contact} variant="secondary" size="lg">
                                    {t("common:footer.contact.cta")}
                                </ButtonLink>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Reveal>
                <section className={css.aboutMe} aria-labelledby="about-me-heading">
                    <div className={css.container}>
                        <h2
                            id="about-me-heading"
                            className={`${css.sectionHeading} ${css.aboutMeHeading}`}
                        >
                            {t("about:aboutMe.heading")}
                        </h2>
                        <div className={css.aboutMeGrid}>
                            <SkeletonSwap
                                isLoading={profile.isLoading}
                                skeleton={
                                    <div className={css.paragraphs}>
                                        <Skeleton />
                                        <Skeleton />
                                        <Skeleton width="medium" />
                                    </div>
                                }
                            >
                                {profile.isError && (
                                    <PartError announce={false} onRetry={profile.retry} />
                                )}
                                {data && (
                                    <div className={css.paragraphs}>
                                        {data.aboutParagraphs.map((paragraph) => (
                                            <p key={paragraph} className={css.paragraph}>
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </SkeletonSwap>
                            {data && <AboutNowCard profile={data} />}
                        </div>
                    </div>
                </section>
            </Reveal>
            {show.stack && (
                <Reveal>
                    <section className={css.stack} aria-labelledby="about-stack-heading">
                        <div className={css.container}>
                            <h2 id="about-stack-heading" className={css.sectionHeading}>
                                {t("about:stack.heading")}
                            </h2>
                            <SkeletonSwap
                                isLoading={profile.isLoading}
                                skeleton={<ChipsSkeleton />}
                            >
                                {profile.isError && (
                                    <PartError announce={false} onRetry={profile.retry} />
                                )}
                                <StackGroupList groups={stackGroups} />
                            </SkeletonSwap>
                        </div>
                    </section>
                </Reveal>
            )}
            {show.complements && (
                <Reveal>
                    <section className={css.complements} aria-labelledby={complementsLabelledBy}>
                        <div className={css.complementsGrid}>
                            {show.certificates && (
                                <div className={css.column}>
                                    <h2
                                        id="about-certificates-heading"
                                        className={css.columnHeading}
                                    >
                                        {t("about:complements.certificates")}
                                    </h2>
                                    <SkeletonSwap
                                        isLoading={timeline.isLoading}
                                        skeleton={<ChipsSkeleton />}
                                    >
                                        {timeline.isError && (
                                            <PartError
                                                announce
                                                id={ids.timelineAlert}
                                                onRetry={timeline.retry}
                                            />
                                        )}
                                        <ul className={css.chips}>
                                            {timeline.certificates.map((certificate) => (
                                                <li key={certificate.id}>
                                                    <CertificateChip certificate={certificate} />
                                                </li>
                                            ))}
                                        </ul>
                                    </SkeletonSwap>
                                </div>
                            )}
                            {show.workStyle && (
                                <div className={css.column}>
                                    <h2 id="about-work-style-heading" className={css.columnHeading}>
                                        {t("about:complements.workStyle")}
                                    </h2>
                                    <SkeletonSwap
                                        isLoading={profile.isLoading}
                                        skeleton={<ChipsSkeleton />}
                                    >
                                        {profile.isError && (
                                            <PartError announce={false} onRetry={profile.retry} />
                                        )}
                                        <ul className={css.chips}>
                                            {workPrinciples.map((principle) => (
                                                <li key={principle}>
                                                    <Chip>{principle}</Chip>
                                                </li>
                                            ))}
                                        </ul>
                                    </SkeletonSwap>
                                </div>
                            )}
                        </div>
                    </section>
                </Reveal>
            )}
            {show.trajectory && (
                <Reveal>
                    <section className={css.trajectory} aria-labelledby={ids.timelineHeading}>
                        <div className={css.container}>
                            <h2
                                id={ids.timelineHeading}
                                tabIndex={-1}
                                className={css.sectionHeading}
                            >
                                {t("about:trajectory.heading")}
                            </h2>
                            <p className={css.hint}>{t("about:trajectory.hint")}</p>
                            <SkeletonSwap
                                isLoading={timeline.isLoading}
                                skeleton={
                                    <div className={css.trajectorySkeleton}>
                                        <Skeleton shape="card" />
                                        <Skeleton shape="card" />
                                    </div>
                                }
                            >
                                {timeline.isError && (
                                    <PartError announce={false} onRetry={timeline.retry} />
                                )}
                                <div className={css.groups}>
                                    {timeline.groups.map((group) => (
                                        <TrajectoryGroup
                                            key={group.kind}
                                            group={group}
                                            onOpen={open}
                                            registerTrigger={registerTrigger}
                                        />
                                    ))}
                                </div>
                            </SkeletonSwap>
                        </div>
                    </section>
                </Reveal>
            )}
            <TrajectoryModal item={selectedItem} onClose={close} />
            <ResumeModal isOpen={resume.isOpen} onClose={resume.close} />
        </>
    )
}

export default AboutPage
