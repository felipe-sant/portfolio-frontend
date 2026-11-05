import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import CopyEmailButton from "@/components/CopyEmailButton"
import Icon from "@/components/Icon"
import ResumeLink from "@/components/ResumeLink"
import ResumeModal from "@/components/ResumeModal"
import Skeleton from "@/components/Skeleton"
import useResume from "@/hooks/useResume"
import buttonCss from "@/styles/components/button.module.css"
import css from "@/styles/components/contactChannels.module.css"
import type Profile from "@/types/profile/Profile.types"
import formatLocation from "@/utils/formatLocation"

interface ContactChannelsProps {
    profile?: Profile
}

interface ChannelBlockProps {
    heading: string
    children: ReactNode
}

function ChannelBlock({ heading, children }: ChannelBlockProps) {
    return (
        <div className={css.block}>
            <h2 className={css.label}>{heading}</h2>
            {children}
        </div>
    )
}

function ChannelSkeleton() {
    return (
        <div className={css.skeleton}>
            <Skeleton width="medium" />
            <Skeleton width="short" />
        </div>
    )
}

function ContactChannels({ profile }: ContactChannelsProps) {
    const { t } = useTranslation(["contact", "common"])
    const responseTime = profile?.contact.responseTime
    const resume = useResume()

    return (
        <div className={css.channels}>
            <ChannelBlock heading={t("channels.email.heading")}>
                {profile ? (
                    <>
                        <p className={css.email}>{profile.contact.email}</p>
                        <div className={css.actions}>
                            <CopyEmailButton email={profile.contact.email} />
                            <a
                                href={`mailto:${profile.contact.email}`}
                                className={`${buttonCss.button} ${buttonCss.primary} ${buttonCss.md} ${css.mailLink}`}
                            >
                                <Icon name="mail" />
                                {t("channels.email.send")}
                            </a>
                        </div>
                    </>
                ) : (
                    <>
                        <Skeleton announce />
                        <ChannelSkeleton />
                    </>
                )}
            </ChannelBlock>
            <div className={css.pair}>
                <ChannelBlock heading={t("channels.location.heading")}>
                    {profile ? (
                        <>
                            <p className={css.value}>{formatLocation(profile.location)}</p>
                            {profile.location.detail && (
                                <p className={css.detail}>{profile.location.detail}</p>
                            )}
                        </>
                    ) : (
                        <ChannelSkeleton />
                    )}
                </ChannelBlock>
                {(!profile || responseTime) && (
                    <ChannelBlock heading={t("channels.response.heading")}>
                        {responseTime ? (
                            <>
                                <p className={css.value}>{responseTime.label}</p>
                                {responseTime.detail && (
                                    <p className={css.detail}>{responseTime.detail}</p>
                                )}
                            </>
                        ) : (
                            <ChannelSkeleton />
                        )}
                    </ChannelBlock>
                )}
            </div>
            <div className={css.resume}>
                <ResumeLink
                    href={resume.href}
                    onOpen={resume.open}
                    variant="secondary"
                    aria-label={t("common:resume.downloadPdf")}
                >
                    <Icon name="download" />
                    {t("common:resume.download")}
                </ResumeLink>
            </div>
            <ResumeModal isOpen={resume.isOpen} onClose={resume.close} />
        </div>
    )
}

export default ContactChannels
