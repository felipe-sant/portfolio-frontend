import { useEffect, useRef, useState } from "react"
import useMotion from "@/hooks/useMotion"

const MAX_STEP = 5
const REVEAL_ROOT_MARGIN = "0px 0px -64px 0px"
const BELOW_FOLD_RATIO = 0.88

function useReveal<T extends HTMLElement>(index = 0) {
    const { motion } = useMotion()
    const ref = useRef<T>(null)
    const canObserve = motion === "full" && typeof IntersectionObserver !== "undefined"
    const [isHidden, setIsHidden] = useState(false)

    useEffect(() => {
        const element = ref.current

        if (!canObserve || !element) {
            return
        }

        const isBelowFold =
            element.getBoundingClientRect().top >= window.innerHeight * BELOW_FOLD_RATIO

        if (!isBelowFold) {
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setIsHidden(false)
                    observer.disconnect()
                }
            },
            { rootMargin: REVEAL_ROOT_MARGIN }
        )

        setIsHidden(true)
        observer.observe(element)

        return () => observer.disconnect()
    }, [canObserve])

    const isVisible = !canObserve || !isHidden

    const revealProps = {
        "data-reveal": isVisible ? "visible" : "hidden",
        "data-reveal-step": Math.min(index, MAX_STEP)
    }

    return { ref, revealProps }
}

export default useReveal
