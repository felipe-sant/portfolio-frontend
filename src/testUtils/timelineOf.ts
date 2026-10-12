import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function timelineOf(snapshot: ContentSnapshot, lang: SupportedLanguage) {
    const timeline = snapshot.languages[lang].timeline

    if (!timeline) {
        throw new Error("Snapshot de teste sem trajetória")
    }

    return timeline
}

export default timelineOf
