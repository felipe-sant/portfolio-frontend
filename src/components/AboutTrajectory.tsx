import type { Ref } from "react"
import { useTranslation } from "react-i18next"
import AboutAsync from "@/components/AboutAsync"
import Section from "@/components/Section"
import Skeleton from "@/components/Skeleton"
import TrajectoryGroup from "@/components/TrajectoryGroup"
import css from "@/styles/components/aboutTrajectory.module.css"
import type AboutTimelineState from "@/types/about/AboutTimelineState.types"
import type TimelineItem from "@/types/timeline/TimelineItem.types"

interface AboutTrajectoryProps {
    timeline: AboutTimelineState
    headingId: string
    alertId: string
    onOpen: (item: TimelineItem) => void
    registerTrigger: (id: string) => Ref<HTMLButtonElement>
}

function AboutTrajectory({
    timeline,
    headingId,
    alertId,
    onOpen,
    registerTrigger
}: AboutTrajectoryProps) {
    const { t } = useTranslation("about")

    return (
        <Section
            reveal
            className={css.section}
            headingId={headingId}
            heading={t("trajectory.heading")}
            headingFocusable
            hint={t("trajectory.hint")}
        >
            <AboutAsync
                isLoading={timeline.isLoading}
                isError={timeline.isError}
                onRetry={timeline.retry}
                errorId={alertId}
                announce
                skeleton={
                    <div className={css.skeleton}>
                        <Skeleton shape="card" />
                        <Skeleton shape="card" />
                    </div>
                }
            >
                <div className={css.groups}>
                    {timeline.groups.map((group) => (
                        <TrajectoryGroup
                            key={group.kind}
                            group={group}
                            onOpen={onOpen}
                            registerTrigger={registerTrigger}
                        />
                    ))}
                </div>
            </AboutAsync>
        </Section>
    )
}

export default AboutTrajectory
