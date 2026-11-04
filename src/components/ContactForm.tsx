import { useId } from "react"
import { useTranslation } from "react-i18next"
import Button from "@/components/Button"
import Icon from "@/components/Icon"
import RadioChipGroup from "@/components/RadioChipGroup"
import TextField from "@/components/TextField"
import CONTACT_SUBJECTS from "@/enum/contactSubjects.enum"
import useContactForm from "@/pages/hooks/useContactForm"
import css from "@/styles/components/contactForm.module.css"
import visuallyHiddenCss from "@/styles/components/visuallyHidden.module.css"
import type ContactAnnouncement from "@/types/contact/ContactAnnouncement.types"

const MESSAGE_MAX_LENGTH = 600
const NEAR_LIMIT_THRESHOLD = 60

interface AnnouncementTextProps {
    announcement: ContactAnnouncement | null
}

function AnnouncementText({ announcement }: AnnouncementTextProps) {
    const { t } = useTranslation("contact")

    if (!announcement) {
        return null
    }

    return announcement.kind === "nearLimit"
        ? t("form.message.nearLimit", { count: announcement.count })
        : t("form.message.limitReached", { max: MESSAGE_MAX_LENGTH })
}

function ContactForm() {
    const { t } = useTranslation("contact")
    const counterId = useId()
    const {
        values,
        errors,
        status,
        summaryCount,
        remaining,
        announcement,
        nameRef,
        emailRef,
        messageRef,
        submitRef,
        sentHeadingRef,
        setField,
        submit,
        reset
    } = useContactForm()
    const isSending = status === "sending"
    const subjectOptions = CONTACT_SUBJECTS.map((subject) => ({
        value: subject,
        label: t(`form.subject.options.${subject}`)
    }))

    return (
        <section aria-label={t("form.label")} className={css.section}>
            <div role={"status"}>
                {status === "sent" && (
                    <div className={css.sent}>
                        <Icon name="check" size={20} />
                        <h2 ref={sentHeadingRef} tabIndex={-1} className={css.sentHeading}>
                            {t("form.sent.heading")}
                        </h2>
                        <p className={css.sentText}>{t("form.sent.description")}</p>
                        <Button variant="secondary" onClick={() => reset()}>
                            {t("form.sent.again")}
                        </Button>
                    </div>
                )}
            </div>
            {status !== "sent" && (
                <form id="contact-form" noValidate className={css.form} onSubmit={submit}>
                    {summaryCount > 0 && (
                        <div role="alert" className={css.banner}>
                            <Icon name="alert" size={18} />
                            <p className={css.bannerText}>
                                {t("form.errorSummary", { count: summaryCount })}
                            </p>
                        </div>
                    )}
                    {status === "failed" && (
                        <div role="alert" className={css.banner}>
                            <Icon name="alert" size={18} />
                            <p className={css.bannerText}>{t("form.sendError")}</p>
                        </div>
                    )}
                    <p className={css.note}>{t("form.requiredNote")}</p>
                    <TextField
                        label={t("form.name.label")}
                        required
                        autoComplete="name"
                        maxLength={100}
                        value={values.name}
                        disabled={isSending}
                        error={errors.name && t("form.name.required")}
                        announceError={false}
                        inputRef={nameRef}
                        onChange={(event) => setField("name", event.target.value)}
                    />
                    <TextField
                        label={t("form.email.label")}
                        required
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        maxLength={254}
                        value={values.email}
                        disabled={isSending}
                        error={errors.email && t(`form.email.${errors.email}`)}
                        announceError={false}
                        inputRef={emailRef}
                        onChange={(event) => setField("email", event.target.value)}
                    />
                    <RadioChipGroup
                        legend={t("form.subject.legend")}
                        name="subject"
                        options={subjectOptions}
                        value={values.subject}
                        disabled={isSending}
                        onChange={(subject) => setField("subject", subject)}
                    />
                    <TextField
                        label={t("form.message.label")}
                        required
                        multiline
                        rows={6}
                        maxLength={MESSAGE_MAX_LENGTH}
                        placeholder={t("form.message.placeholder")}
                        value={values.message}
                        disabled={isSending}
                        error={errors.message && t("form.message.tooShort")}
                        announceError={false}
                        describedBy={counterId}
                        inputRef={messageRef}
                        labelAddon={
                            <span
                                id={counterId}
                                className={
                                    remaining < NEAR_LIMIT_THRESHOLD
                                        ? `${css.counter} ${css.counterWarning}`
                                        : css.counter
                                }
                            >
                                {t("form.message.remaining", { count: remaining })}
                            </span>
                        }
                        onChange={(event) => setField("message", event.target.value)}
                    />
                    <div className={visuallyHiddenCss.visuallyHidden} aria-live="polite">
                        <AnnouncementText announcement={announcement} />
                    </div>
                    <div className={css.actions}>
                        <Button
                            ref={submitRef}
                            type="submit"
                            size="lg"
                            loading={isSending}
                            className={css.submit}
                        >
                            {isSending ? t("form.sending") : t("form.submit")}
                        </Button>
                        <p className={css.note}>{t("form.privacyNote")}</p>
                    </div>
                </form>
            )}
        </section>
    )
}

export default ContactForm
