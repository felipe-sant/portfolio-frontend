import { redirect } from "react-router-dom"
import addLanguagePrefix from "@/i18n/addLanguagePrefix"
import getPreferredLanguage from "@/i18n/getPreferredLanguage"

function redirectRootLoader({ request }: { request: Request }) {
    const { search, hash } = new URL(request.url)

    return redirect(`${addLanguagePrefix("/", getPreferredLanguage())}${search}${hash}`)
}

export default redirectRootLoader
