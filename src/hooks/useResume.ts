import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import getResumePath from "@/utils/getResumePath"

function useResume() {
    const { i18n } = useTranslation()
    const { pathname } = useLocation()
    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
    const [isOpen, setIsOpen] = useState(false)
    const [currentPathname, setCurrentPathname] = useState(pathname)
    const trigger = useRef<HTMLElement | null>(null)

    if (currentPathname !== pathname) {
        setCurrentPathname(pathname)
        setIsOpen(false)
    }

    useEffect(() => {
        if (!isOpen) {
            trigger.current?.focus()
            trigger.current = null
        }
    }, [isOpen])

    function open(element: HTMLElement) {
        trigger.current = element
        setIsOpen(true)
    }

    function close() {
        setIsOpen(false)
    }

    return { href: getResumePath(language), isOpen, open, close }
}

export default useResume
