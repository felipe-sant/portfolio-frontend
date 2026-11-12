import { useTranslation } from "react-i18next"
import AboutAsync from "@/components/AboutAsync"
import ChipsSkeleton from "@/components/ChipsSkeleton"
import Section from "@/components/Section"
import StackGroupList from "@/components/StackGroupList"
import css from "@/styles/components/aboutStack.module.css"
import type AboutProfileState from "@/types/about/AboutProfileState.types"
import type StackGroup from "@/types/content/StackGroup.types"

interface AboutStackProps {
    profile: AboutProfileState
    groups: StackGroup[]
}

function AboutStack({ profile, groups }: AboutStackProps) {
    const { t } = useTranslation("about")

    return (
        <Section
            reveal
            className={css.section}
            headingId="about-stack-heading"
            heading={t("stack.heading")}
        >
            <AboutAsync
                isLoading={profile.isLoading}
                isError={profile.isError}
                onRetry={profile.retry}
                skeleton={<ChipsSkeleton />}
            >
                <StackGroupList groups={groups} />
            </AboutAsync>
        </Section>
    )
}

export default AboutStack
