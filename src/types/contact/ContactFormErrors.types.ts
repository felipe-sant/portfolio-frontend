interface ContactFormErrors {
    name?: "required"
    email?: "required" | "invalid"
    message?: "tooShort"
}

export default ContactFormErrors
