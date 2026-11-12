import { useTranslation } from "react-i18next"
import AboutAsync from "@/components/AboutAsync"
import AboutNowCard from "@/components/AboutNowCard"
import Section from "@/components/Section"
import Skeleton from "@/components/Skeleton"
import css from "@/styles/components/aboutMeSection.module.css"
import type AboutProfileState from "@/types/about/AboutProfileState.types"

interface AboutMeSectionProps {
    profile: AboutProfileState
}

function AboutMeSection({ profile }: AboutMeSectionProps) {
    const { t } = useTranslation("about")
    const data = profile.data

    return (
        <Section
            reveal
            className={css.section}
            headingId="about-me-heading"
            heading={t("aboutMe.heading")}
            headingTone="weak"
        >
            <div className={css.grid}>
                <AboutAsync
                    isLoading={profile.isLoading}
                    isError={profile.isError}
                    onRetry={profile.retry}
                    skeleton={
                        <div className={css.paragraphs}>
                            <Skeleton />
                            <Skeleton />
                            <Skeleton width="medium" />
                        </div>
                    }
                >
                    {data && (
                        <div className={css.paragraphs}>
                            {data.aboutParagraphs.map((paragraph) => (
                                <p key={paragraph} className={css.paragraph}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    )}
                </AboutAsync>
                {data && <AboutNowCard profile={data} />}
            </div>
        </Section>
    )
}

export default AboutMeSection
