import type ContactFormValues from "@/types/contact/ContactFormValues.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

interface ContactMessage extends ContactFormValues {
    language: SupportedLanguage
    website: string
}

export default ContactMessage
