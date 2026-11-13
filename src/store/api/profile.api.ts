import loadProfile from "@/services/content/loadProfile"
import validateLang from "@/services/content/validateLang"
import api from "@/store/api"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type Profile from "@/types/profile/Profile.types"
import runQueryFn from "@/utils/runQueryFn"

type GetProfileArgs = {
    lang: SupportedLanguage
}

const profileApi = api.injectEndpoints({
    endpoints: (build) => ({
        getProfile: build.query<Profile, GetProfileArgs>({
            queryFn: ({ lang }) =>
                runQueryFn(async () => {
                    validateLang(lang)
                    return await loadProfile(lang)
                })
        })
    })
})

export default profileApi
