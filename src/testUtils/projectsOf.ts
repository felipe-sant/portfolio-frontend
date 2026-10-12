import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function projectsOf(snapshot: ContentSnapshot, lang: SupportedLanguage) {
    const projects = snapshot.languages[lang].projects

    if (!projects) {
        throw new Error("Snapshot de teste sem projetos")
    }

    return projects
}

export default projectsOf
