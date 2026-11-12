import { useTranslation } from "react-i18next"
import getLanguage from "@/i18n/getLanguage"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function useLanguage(): SupportedLanguage {
    useTranslation()

    return getLanguage()
}

export default useLanguage
