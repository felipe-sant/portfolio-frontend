import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"

interface IndicatorBox {
    x: number
    width: number
}

function useNavIndicator() {
    const navRef = useRef<HTMLElement>(null)
    const [box, setBox] = useState<IndicatorBox>()
    const [isAnimated, setIsAnimated] = useState(false)

    const measure = useCallback(() => {
        const active = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]')

        setBox((current) => {
            if (!active) {
                return undefined
            }

            const next = { x: active.offsetLeft, width: active.offsetWidth }

            return current?.x === next.x && current.width === next.width ? current : next
        })
    }, [])

    useLayoutEffect(measure)

    useEffect(() => {
        const nav = navRef.current

        if (!nav) {
            return
        }

        if (typeof ResizeObserver !== "function") {
            window.addEventListener("resize", measure)

            return () => window.removeEventListener("resize", measure)
        }

        const observer = new ResizeObserver(measure)
        observer.observe(nav)
        Array.from(nav.children).forEach((child) => observer.observe(child))

        return () => observer.disconnect()
    }, [measure])

    useEffect(() => {
        const frame = requestAnimationFrame(() => setIsAnimated(true))

        return () => cancelAnimationFrame(frame)
    }, [])

    const indicatorStyle: CSSProperties = box
        ? { transform: `translateX(${box.x}px)`, width: box.width, opacity: 1 }
        : { opacity: 0 }

    return { navRef, indicatorStyle, isAnimated }
}

export default useNavIndicator
