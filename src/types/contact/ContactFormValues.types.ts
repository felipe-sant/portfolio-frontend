import type ContactSubject from "@/types/contact/ContactSubject.types"

interface ContactFormValues {
    name: string
    email: string
    subject: ContactSubject
    message: string
}

export default ContactFormValues
