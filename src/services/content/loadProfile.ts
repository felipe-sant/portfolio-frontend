import readJson from "@/services/content/readJson"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type Profile from "@/types/profile/Profile.types"

function loadProfile(lang: SupportedLanguage): Promise<Profile> {
    return readJson<Profile>(`content/${lang}/profile.json`, () =>
        import("@/services/content/schemas/profile.schema").then((module) => module.default)
    )
}

export default loadProfile
