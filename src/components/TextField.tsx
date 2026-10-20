import { useId, useRef } from "react"
import type { ChangeEventHandler, ComponentPropsWithoutRef, FocusEventHandler } from "react"
import css from "@/styles/components/textField.module.css"
import Icon from "@/components/Icon"
import useFocusOnError from "@/hooks/useFocusOnError"

interface TextFieldProps {
    label: string
    hint?: string
    error?: string
    multiline?: boolean
    rows?: number
    required?: boolean
    describedBy?: string
    reserveMessageSpace?: boolean
    focusOnError?: boolean
    type?: ComponentPropsWithoutRef<"input">["type"]
    name?: string
    value?: string
    defaultValue?: string
    placeholder?: string
    maxLength?: number
    autoComplete?: string
    inputMode?: ComponentPropsWithoutRef<"input">["inputMode"]
    disabled?: boolean
    onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
}

function TextField({
    label,
    hint,
    error,
    multiline = false,
    rows = 4,
    required = false,
    describedBy,
    reserveMessageSpace = false,
    focusOnError = false,
    type = "text",
    ...fieldProps
}: TextFieldProps) {
    const id = useId()
    const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
    useFocusOnError(fieldRef, error, focusOnError)
    const messageId = `${id}-message`
    const message = error ?? hint
    const describedByIds = [message ? messageId : undefined, describedBy].filter(Boolean).join(" ")
    const sharedProps = {
        ...fieldProps,
        id,
        ref: fieldRef,
        className: error ? `${css.field} ${css.invalid}` : css.field,
        "aria-invalid": error ? true : undefined,
        "aria-required": required || undefined,
        "aria-describedby": describedByIds || undefined
    }

    return (
        <div className={css.wrapper}>
            <label htmlFor={id} className={required ? `${css.label} ${css.required}` : css.label}>
                {label}
            </label>
            {multiline ? (
                <textarea {...sharedProps} rows={rows} />
            ) : (
                <input {...sharedProps} type={type} />
            )}
            {(message || reserveMessageSpace) && (
                <div className={css.message}>
                    {message && (
                        <p
                            id={messageId}
                            className={error ? css.error : css.hint}
                            role={error ? "alert" : undefined}
                        >
                            {error && <Icon name="alert" size={14} />}
                            {message}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

export default TextField
