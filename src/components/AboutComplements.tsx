import { useTranslation } from "react-i18next"
import AboutAsync from "@/components/AboutAsync"
import CertificateChip from "@/components/CertificateChip"
import Chip from "@/components/Chip"
import ChipsSkeleton from "@/components/ChipsSkeleton"
import Reveal from "@/components/Reveal"
import css from "@/styles/components/aboutComplements.module.css"
import type AboutProfileState from "@/types/about/AboutProfileState.types"
import type AboutTimelineState from "@/types/about/AboutTimelineState.types"

interface AboutComplementsProps {
    profile: AboutProfileState
    timeline: AboutTimelineState
    workPrinciples: string[]
    showCertificates: boolean
    showWorkStyle: boolean
}

function AboutComplements({
    profile,
    timeline,
    workPrinciples,
    showCertificates,
    showWorkStyle
}: AboutComplementsProps) {
    const { t } = useTranslation("about")
    const labelledBy = [
        showCertificates && "about-certificates-heading",
        showWorkStyle && "about-work-style-heading"
    ]
        .filter(Boolean)
        .join(" ")

    return (
        <Reveal>
            <section className={css.section} aria-labelledby={labelledBy}>
                <div className={css.grid}>
                    {showCertificates && (
                        <div className={css.column}>
                            <h2 id="about-certificates-heading" className={css.heading}>
                                {t("complements.certificates")}
                            </h2>
                            <AboutAsync
                                isLoading={timeline.isLoading}
                                isError={timeline.isError}
                                onRetry={timeline.retry}
                                skeleton={<ChipsSkeleton />}
                            >
                                <ul className={css.chips}>
                                    {timeline.certificates.map((certificate) => (
                                        <li key={certificate.id}>
                                            <CertificateChip certificate={certificate} />
                                        </li>
                                    ))}
                                </ul>
                            </AboutAsync>
                        </div>
                    )}
                    {showWorkStyle && (
                        <div className={css.column}>
                            <h2 id="about-work-style-heading" className={css.heading}>
                                {t("complements.workStyle")}
                            </h2>
                            <AboutAsync
                                isLoading={profile.isLoading}
                                isError={profile.isError}
                                onRetry={profile.retry}
                                skeleton={<ChipsSkeleton />}
                            >
                                <ul className={css.chips}>
                                    {workPrinciples.map((principle) => (
                                        <li key={principle}>
                                            <Chip font={"body"}>{principle}</Chip>
                                        </li>
                                    ))}
                                </ul>
                            </AboutAsync>
                        </div>
                    )}
                </div>
            </section>
        </Reveal>
    )
}

export default AboutComplements
