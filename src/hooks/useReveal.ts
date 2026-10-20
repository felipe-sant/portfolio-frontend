import { useEffect, useRef, useState } from "react"
import useMotion from "@/hooks/useMotion"

const MAX_STEP = 5

function useReveal<T extends HTMLElement>(index = 0) {
    const { motion } = useMotion()
    const ref = useRef<T>(null)
    const canObserve = motion === "full" && typeof IntersectionObserver !== "undefined"
    const [hasEntered, setHasEntered] = useState(false)

    useEffect(() => {
        const element = ref.current

        if (!canObserve || !element) {
            return
        }

        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                setHasEntered(true)
                observer.disconnect()
            }
        })

        observer.observe(element)

        return () => observer.disconnect()
    }, [canObserve])

    const isVisible = !canObserve || hasEntered

    const revealProps = {
        "data-reveal": isVisible ? "visible" : "hidden",
        "data-reveal-step": Math.min(index, MAX_STEP)
    }

    return { ref, revealProps }
}

export default useReveal
