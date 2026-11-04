import type ContactFormErrors from "@/types/contact/ContactFormErrors.types"
import type ContactFormValues from "@/types/contact/ContactFormValues.types"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MESSAGE_MIN_LENGTH = 20

function validateContactForm(values: ContactFormValues): ContactFormErrors {
    const errors: ContactFormErrors = {}
    const email = values.email.trim()

    if (values.name.trim() === "") {
        errors.name = "required"
    }

    if (email === "") {
        errors.email = "required"
    } else if (!EMAIL_PATTERN.test(email)) {
        errors.email = "invalid"
    }

    if (values.message.trim().length < MESSAGE_MIN_LENGTH) {
        errors.message = "tooShort"
    }

    return errors
}

export default validateContactForm
