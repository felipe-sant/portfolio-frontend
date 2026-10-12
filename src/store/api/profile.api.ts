import loadProfile from "@/services/content/loadProfile"
import toQueryError from "@/services/content/toQueryError"
import validateLang from "@/services/content/validateLang"
import api from "@/store/api"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type Profile from "@/types/profile/Profile.types"

type GetProfileArgs = {
    lang: SupportedLanguage
}

const profileApi = api.injectEndpoints({
    endpoints: (build) => ({
        getProfile: build.query<Profile, GetProfileArgs>({
            queryFn: async ({ lang }) => {
                try {
                    validateLang(lang)
                    return { data: await loadProfile(lang) }
                } catch (error) {
                    return { error: toQueryError(error) }
                }
            }
        })
    })
})

export default profileApi
