import useLanguage from "@/hooks/useLanguage"
import buildPath from "@/routers/buildPath"

function useLocalizedPath() {
    const language = useLanguage()

    return (path: string, params?: Record<string, string>) => buildPath(path, language, params)
}

export default useLocalizedPath
