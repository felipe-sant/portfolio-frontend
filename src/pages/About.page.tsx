import AboutComplements from "@/components/AboutComplements"
import AboutHero from "@/components/AboutHero"
import AboutMeSection from "@/components/AboutMeSection"
import AboutStack from "@/components/AboutStack"
import AboutTrajectory from "@/components/AboutTrajectory"
import JsonLd from "@/components/JsonLd"
import LazyResumeModal from "@/components/LazyResumeModal"
import PageMeta from "@/components/PageMeta"
import TrajectoryModal from "@/components/TrajectoryModal"
import VisuallyHidden from "@/components/VisuallyHidden"
import useAbout from "@/pages/hooks/useAbout"
import ROUTES from "@/routers/paths"

function AboutPage() {
    const {
        t,
        shareImage,
        jsonLd,
        isLoading,
        paths,
        resume,
        ids,
        profile,
        timeline,
        stackGroups,
        workPrinciples,
        updatedLabel,
        show,
        trajectory
    } = useAbout()

    return (
        <>
            <title>{t("about:meta.title")}</title>
            <meta name="description" content={t("about:meta.description")} />
            <PageMeta
                title={t("about:meta.title")}
                description={t("about:meta.description")}
                path={ROUTES.about}
                type="profile"
                image={shareImage.image}
                imageAlt={shareImage.imageAlt}
            />
            <JsonLd data={jsonLd} />
            {isLoading && <VisuallyHidden role={"status"}>{t("common:loading")}</VisuallyHidden>}
            <AboutHero
                profile={profile}
                headingId={ids.profileHeading}
                alertId={ids.profileAlert}
                updatedLabel={updatedLabel}
                contactPath={paths.contact}
                resumeHref={resume.href}
                onOpenResume={resume.open}
            />
            <AboutMeSection profile={profile} />
            {show.trajectory && (
                <AboutTrajectory
                    timeline={timeline}
                    headingId={ids.timelineHeading}
                    alertId={ids.timelineAlert}
                    onOpen={trajectory.open}
                    registerTrigger={trajectory.registerTrigger}
                />
            )}
            {show.stack && <AboutStack profile={profile} groups={stackGroups} />}
            {show.complements && (
                <AboutComplements
                    profile={profile}
                    timeline={timeline}
                    workPrinciples={workPrinciples}
                    showCertificates={show.certificates}
                    showWorkStyle={show.workStyle}
                />
            )}
            <TrajectoryModal item={trajectory.selectedItem} onClose={trajectory.close} />
            <LazyResumeModal isOpen={resume.isOpen} onClose={resume.close} />
        </>
    )
}

export default AboutPage
