import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import useLanguage from "@/hooks/useLanguage"
import getResumePath from "@/utils/getResumePath"

function useResume() {
    const { pathname } = useLocation()
    const language = useLanguage()
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
