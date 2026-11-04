import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import getLanguage from "@/i18n/getLanguage"
import contactApi from "@/store/api/contact.api"
import type ContactAnnouncement from "@/types/contact/ContactAnnouncement.types"
import type ContactFormErrors from "@/types/contact/ContactFormErrors.types"
import type ContactFormValues from "@/types/contact/ContactFormValues.types"
import MESSAGE_MAX_LENGTH from "@/utils/contactMessageMaxLength"
import NEAR_LIMIT_THRESHOLD from "@/utils/contactNearLimitThreshold"
import validateContactForm from "@/utils/validateContactForm"

type FocusTarget = "name" | "email" | "message" | "submit" | "sentHeading"

type FocusRequest = { target: FocusTarget }

type ErrorState = { errors: ContactFormErrors; summaryCount: number }

type ContactFormStatus = "idle" | "sending" | "sent" | "failed"

const FIELD_ORDER = ["name", "email", "message"] as const

const EMPTY_VALUES: ContactFormValues = {
    name: "",
    email: "",
    subject: "newProject",
    message: ""
}

const EMPTY_ERROR_STATE: ErrorState = { errors: {}, summaryCount: 0 }

function countErrors(errors: ContactFormErrors): number {
    return Object.values(errors).filter(Boolean).length
}

function getAnnouncement(
    previousRemaining: number,
    remaining: number,
    current: ContactAnnouncement | null
): ContactAnnouncement | null {
    if (remaining >= NEAR_LIMIT_THRESHOLD) {
        return null
    }

    if (remaining === 0) {
        return previousRemaining === 0 ? current : { kind: "limitReached" }
    }

    return previousRemaining >= NEAR_LIMIT_THRESHOLD
        ? { kind: "nearLimit", count: remaining }
        : current
}

function useContactForm() {
    const [values, setValues] = useState<ContactFormValues>(EMPTY_VALUES)
    const [errorState, setErrorState] = useState<ErrorState>(EMPTY_ERROR_STATE)
    const [status, setStatus] = useState<ContactFormStatus>("idle")
    const [announcement, setAnnouncement] = useState<ContactAnnouncement | null>(null)
    const [shouldRevalidate, setShouldRevalidate] = useState(false)
    const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null)
    const isSending = useRef(false)
    const nameRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
    const emailRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
    const messageRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
    const submitRef = useRef<HTMLButtonElement | null>(null)
    const sentHeadingRef = useRef<HTMLHeadingElement | null>(null)
    const [sendMessage, { reset: resetMutation }] = contactApi.useSendContactMessageMutation()
    const remaining = MESSAGE_MAX_LENGTH - values.message.length

    useEffect(() => {
        if (!focusRequest) {
            return
        }

        const targets = {
            name: nameRef,
            email: emailRef,
            message: messageRef,
            submit: submitRef,
            sentHeading: sentHeadingRef
        }

        targets[focusRequest.target].current?.focus()
    }, [focusRequest])

    function setField<Field extends keyof ContactFormValues>(
        field: Field,
        value: ContactFormValues[Field]
    ) {
        setValues((previous) => ({ ...previous, [field]: value }))

        if (field === "message") {
            const previousRemaining = MESSAGE_MAX_LENGTH - values.message.length
            const nextRemaining = MESSAGE_MAX_LENGTH - String(value).length

            setAnnouncement((current) => getAnnouncement(previousRemaining, nextRemaining, current))
        }

        if (shouldRevalidate && field !== "subject") {
            const fieldError = Object.entries(
                validateContactForm({ ...EMPTY_VALUES, [field]: value })
            ).find(([key]) => key === field)?.[1]

            setErrorState((previous) => {
                const errors = { ...previous.errors, [field]: fieldError }

                return {
                    errors,
                    summaryCount: countErrors(errors) === 0 ? 0 : previous.summaryCount
                }
            })
        }
    }

    async function submit(event?: FormEvent) {
        event?.preventDefault()

        if (isSending.current) {
            return
        }

        setStatus("idle")
        const errors = validateContactForm(values)
        const invalidField = FIELD_ORDER.find((field) => errors[field])

        if (invalidField) {
            setShouldRevalidate(true)
            setErrorState({ errors, summaryCount: countErrors(errors) })
            setFocusRequest({ target: invalidField })
            return
        }

        isSending.current = true
        setErrorState(EMPTY_ERROR_STATE)
        setStatus("sending")

        try {
            await sendMessage({ ...values, language: getLanguage(), website: "" }).unwrap()
            setStatus("sent")
            setFocusRequest({ target: "sentHeading" })
        } catch {
            setStatus("failed")
            setFocusRequest({ target: "submit" })
        } finally {
            isSending.current = false
            resetMutation()
        }
    }

    function reset() {
        setValues(EMPTY_VALUES)
        setErrorState(EMPTY_ERROR_STATE)
        setAnnouncement(null)
        setShouldRevalidate(false)
        setStatus("idle")
        setFocusRequest({ target: "name" })
    }

    return {
        values,
        errors: errorState.errors,
        summaryCount: errorState.summaryCount,
        status,
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
    }
}

export default useContactForm
