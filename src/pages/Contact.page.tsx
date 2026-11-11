import { Suspense, lazy } from "react"
import AvailabilityBadge from "@/components/AvailabilityBadge"
import ContactChannels from "@/components/ContactChannels"
import JsonLd from "@/components/JsonLd"
import LoadError from "@/components/LoadError"
import PageMeta from "@/components/PageMeta"
import useContact from "@/pages/hooks/useContact"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/contact.module.css"

const ContactForm = lazy(() => import("@/components/ContactForm"))

function ContactPage() {
    const { t, shareImage, jsonLd, profile, isError, isFormEnabled, ids, retry } = useContact()

    return (
        <>
            <title>{t("contact:meta.title")}</title>
            <meta name="description" content={t("contact:meta.description")} />
            <PageMeta
                title={t("contact:meta.title")}
                description={t("contact:meta.description")}
                path={ROUTES.contact}
                image={shareImage.image}
                imageAlt={shareImage.imageAlt}
            />
            <JsonLd data={jsonLd} />
            <div className={isFormEnabled ? css.container : css.containerDirect}>
                <div className={css.header}>
                    <div className={css.badgeSlot}>
                        {profile?.availability.isAvailable && (
                            <AvailabilityBadge label={profile.availability.label} />
                        )}
                    </div>
                    <h1 id={ids.heading} tabIndex={-1} className={css.heading}>
                        {t("contact:heading")}
                    </h1>
                    <p className={css.lede}>
                        {isFormEnabled ? t("contact:lede.form") : t("contact:lede.direct")}
                    </p>
                </div>
                <div className={isFormEnabled ? css.withForm : css.direct}>
                    {isFormEnabled && (
                        <div className={css.form}>
                            <Suspense fallback={null}>
                                <ContactForm />
                            </Suspense>
                        </div>
                    )}
                    <div className={css.channels}>
                        {isError ? (
                            <LoadError
                                id={ids.alert}
                                title={t("contact:channels.loadError")}
                                retryLabel={t("contact:channels.retry")}
                                onRetry={retry}
                            />
                        ) : (
                            <ContactChannels profile={profile} />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ContactPage
