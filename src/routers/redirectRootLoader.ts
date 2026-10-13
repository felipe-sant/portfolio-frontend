import { redirect } from "react-router-dom"
import addLanguagePrefix from "@/i18n/addLanguagePrefix"
import getPreferredLanguage from "@/i18n/getPreferredLanguage"

function redirectRootLoader({ request }: { request: Request }) {
    const { search } = new URL(request.url)

    return redirect(`${addLanguagePrefix("/", getPreferredLanguage())}${search}`)
}

export default redirectRootLoader
