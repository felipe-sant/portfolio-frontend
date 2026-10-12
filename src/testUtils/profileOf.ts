import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function profileOf(snapshot: ContentSnapshot, lang: SupportedLanguage) {
    const profile = snapshot.languages[lang].profile

    if (!profile) {
        throw new Error("Snapshot de teste sem perfil")
    }

    return profile
}

export default profileOf
