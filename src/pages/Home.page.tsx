import { Link } from "react-router-dom"
import AvailabilityBadge from "@/components/AvailabilityBadge"
import ButtonLink from "@/components/ButtonLink"
import FeaturedProject from "@/components/FeaturedProject"
import Icon from "@/components/Icon"
import JsonLd from "@/components/JsonLd"
import LoadError from "@/components/LoadError"
import PageMeta from "@/components/PageMeta"
import Skeleton from "@/components/Skeleton"
import SkeletonSwap from "@/components/SkeletonSwap"
import Reveal from "@/components/Reveal"
import StackMarquee from "@/components/StackMarquee"
import StatusCard from "@/components/StatusCard"
import VisuallyHidden from "@/components/VisuallyHidden"
import useHome from "@/pages/hooks/useHome"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/home.module.css"

function FeaturedSkeletonItem({ mirrored }: { mirrored: boolean }) {
    return (
        <li className={css.skeletonItem} data-mirrored={mirrored ? "true" : undefined}>
            <Skeleton shape="media" />
            <div className={css.skeletonBody}>
                <Skeleton shape="title" width="medium" />
                <Skeleton />
                <Skeleton width="medium" />
            </div>
        </li>
    )
}

function HomePage() {
    const { t, jsonLd, isLoading, paths, viewTransition, ids, profile, status, featured } =
        useHome()
    const hasStatus = Boolean(status.working || status.studying)

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
            {isLoading && <VisuallyHidden role={"status"}>{t("common:loading")}</VisuallyHidden>}
            <div className={css.firstScreen}>
                <section className={css.hero}>
                    <div className={css.container}>
                        <div className={css.badgeSlot}>
                            <SkeletonSwap
                                isLoading={profile.isLoading}
                                skeleton={<Skeleton shape="title" width="medium" />}
                            >
                                {profile.availability?.isAvailable && (
                                    <AvailabilityBadge label={profile.availability.label} />
                                )}
                            </SkeletonSwap>
                        </div>
                        <h1 className={css.heading}>{t("home:heading")}</h1>
                        <div className={css.intro}>
                            <SkeletonSwap
                                isLoading={profile.isLoading}
                                skeleton={
                                    <div className={css.introSkeleton}>
                                        <Skeleton />
                                        <Skeleton />
                                        <Skeleton width="medium" />
                                    </div>
                                }
                            >
                                {profile.intro && <p>{profile.intro}</p>}
                            </SkeletonSwap>
                        </div>
                        <div className={css.actions}>
                            <ButtonLink to={paths.projects} size="lg">
                                {t("home:hero.viewProjects")}
                                <Icon name="arrowRight" />
                            </ButtonLink>
                            <ButtonLink
                                to={paths.resume}
                                reloadDocument
                                variant="secondary"
                                size="lg"
                                aria-label={t("common:resume.downloadPdf")}
                            >
                                <Icon name="download" />
                                {t("common:resume.download")}
                            </ButtonLink>
                        </div>
                    </div>
                </section>
                {(status.isLoading || status.isError || hasStatus) && (
                    <section className={css.status} aria-labelledby={ids.statusHeading}>
                        <div className={css.container}>
                            <h2
                                id={ids.statusHeading}

                                tabIndex={-1}
                                className={css.statusHeading}
                            >
                                {t("home:status.heading")}
                            </h2>
                            <SkeletonSwap
                                isLoading={status.isLoading}
                                skeleton={
                                    <div className={css.cards}>
                                        <Skeleton shape="card" />
                                        <Skeleton shape="card" />
                                    </div>
                                }
                            >
                                {status.isError && (
                                    <LoadError
                                        id={ids.statusAlert}
                                        title={t("home:status.error")}
                                        description={t("home:loadError.description")}
                                        retryLabel={t("home:loadError.retry")}
                                        onRetry={status.retry}
                                    />
                                )}
                                {!status.isError && (
                                    <div className={css.cards}>
                                        {status.working && (
                                            <StatusCard
                                                variant="working"
                                                label={t("home:status.working")}
                                                title={status.working.title}
                                                organization={status.working.organization}
                                                stage={status.working.stage}
                                                start={status.working.start}
                                            />
                                        )}
                                        {status.studying && (
                                            <StatusCard
                                                variant="studying"
                                                label={t("home:status.studying")}
                                                title={status.studying.title}
                                                organization={status.studying.organization}
                                                stage={status.studying.stage}
                                                start={status.studying.start}
                                            />
                                        )}
                                    </div>
                                )}
                            </SkeletonSwap>
                        </div>
                    </section>
                )}
            </div>
            <SkeletonSwap
                isLoading={profile.isLoading}
                skeleton={<div className={css.stackReserve} aria-hidden="true" />}
            >
                {profile.stack.length > 0 && (
                    <StackMarquee items={profile.stack} heading={t("home:stack.heading")} />
                )}
            </SkeletonSwap>
            <section className={css.featured} aria-labelledby={ids.featuredHeading}>
                <div className={css.container}>
                    <Reveal>
                        <div className={css.featuredHeader}>
                            <h2
                                id={ids.featuredHeading}

                                tabIndex={-1}
                                className={css.featuredHeading}
                            >
                                {t("home:featured.heading")}
                            </h2>
                            <Link
                                to={paths.projects}
                                viewTransition={viewTransition}
                                className={css.viewAll}
                                aria-label={t("home:featured.viewAllName")}
                            >
                                {t("home:featured.viewAll")}
                                <span aria-hidden="true">{t("common:symbols.forward")}</span>
                            </Link>
                        </div>
                    </Reveal>
                    <SkeletonSwap
                        isLoading={featured.isLoading}
                        skeleton={
                            <ul className={css.featuredList}>
                                <FeaturedSkeletonItem mirrored={false} />
                                <FeaturedSkeletonItem mirrored />
                            </ul>
                        }
                    >
                        {featured.isError && (
                            <LoadError
                                id={ids.featuredAlert}
                                title={t("home:featured.error")}
                                description={t("home:loadError.description")}
                                retryLabel={t("home:loadError.retry")}
                                onRetry={featured.retry}
                            />
                        )}
                        {!featured.isError && featured.projects.length === 0 && (
                            <p className={css.empty}>{t("home:featured.empty")}</p>
                        )}
                        {!featured.isError && featured.projects.length > 0 && (
                            <ul className={css.featuredList}>
                                {featured.projects.map((project, index) => (
                                    <li key={project.id}>
                                        <FeaturedProject
                                            project={project}
                                            index={index}
                                            viewProjectLabel={t("home:featured.viewProject")}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </SkeletonSwap>
                    <Reveal>
                        <div className={css.exits}>
                            <ButtonLink to={paths.projects} size="lg">
                                {t("home:exits.allProjects")}
                            </ButtonLink>
                            <ButtonLink to={paths.about} variant="secondary" size="lg">
                                {t("home:exits.about")}
                            </ButtonLink>
                        </div>
                    </Reveal>
                </div>
            </section>
        </>
    )
}

export default HomePage
