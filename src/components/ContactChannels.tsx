import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import CopyEmailButton from "@/components/CopyEmailButton"
import Icon from "@/components/Icon"
import ResumeLink from "@/components/ResumeLink"
import LazyResumeModal from "@/components/LazyResumeModal"
import Skeleton from "@/components/Skeleton"
import VisuallyHidden from "@/components/VisuallyHidden"
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
        <>
            <p className={css.value}>
                <Skeleton width="medium" />
            </p>
            <p className={css.detail}>
                <Skeleton width="short" />
            </p>
        </>
    )
}

interface ActionSkeletonProps {
    icon: "copy" | "mail"
    label: string
}

function ActionSkeleton({ icon, label }: ActionSkeletonProps) {
    return (
        <span
            className={`${buttonCss.button} ${buttonCss.md} ${css.actionSkeleton}`}
            aria-hidden="true"
        >
            <Icon name={icon} />
            {label}
            <Skeleton shape="fill" />
        </span>
    )
}

function EmailSkeleton() {
    const { t } = useTranslation(["contact", "common"])

    return (
        <>
            <p className={`${css.email} ${css.emailSkeleton}`}>
                <Skeleton width="medium" />
            </p>
            <div className={css.actions}>
                <ActionSkeleton icon="copy" label={t("common:footer.copyEmail.idle")} />
                <ActionSkeleton icon="mail" label={t("channels.email.send")} />
            </div>
        </>
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
                        <VisuallyHidden role={"status"}>{t("common:loading")}</VisuallyHidden>
                        <EmailSkeleton />
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
            <LazyResumeModal isOpen={resume.isOpen} onClose={resume.close} />
        </div>
    )
}

export default ContactChannels
