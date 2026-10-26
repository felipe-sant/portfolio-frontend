import { createInstance } from "i18next"
import { initReactI18next } from "react-i18next"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import getLanguageFromPath from "@/i18n/getLanguageFromPath"
import resources from "@/i18n/resources"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import removeBasePath from "@/utils/removeBasePath"

const i18n = createInstance().use(initReactI18next)

if (typeof document !== "undefined") {
    i18n.on("languageChanged", (language) => {
        document.documentElement.lang = language
    })
}

void i18n.init({
    resources,
    lng:
        typeof window === "undefined"
            ? undefined
            : getLanguageFromPath(removeBasePath(window.location.pathname)),
    supportedLngs: SUPPORTED_LANGUAGES,
    fallbackLng: FALLBACK_LANGUAGE,
    defaultNS: "common",
    ns: ["common", "home", "notFound", "error", "projects"],
    initAsync: false,
    interpolation: {
        escapeValue: false
    }
})

export default i18n
