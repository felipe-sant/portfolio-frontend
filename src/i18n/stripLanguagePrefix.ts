import getLanguageFromPath from "@/i18n/getLanguageFromPath"

function stripLanguagePrefix(pathname: string): string {
    const language = getLanguageFromPath(pathname)

    if (!language) {
        return pathname
    }

    const rest = pathname.slice(language.length + 1)

    return rest === "" || rest === "/" ? "/" : rest
}

export default stripLanguagePrefix
