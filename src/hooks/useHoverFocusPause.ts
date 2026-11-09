import { useRef, useState } from "react"
import type { FocusEvent, PointerEvent } from "react"

const TOUCH_FOCUS_WINDOW_MS = 1000

function isTouchLike(event: PointerEvent<HTMLElement>) {
    return event.pointerType === "touch" || event.pointerType === "pen"
}

function useHoverFocusPause<T extends HTMLElement>() {
    const [isPointerInside, setIsPointerInside] = useState(false)
    const [isFocusInside, setIsFocusInside] = useState(false)
    const [isTouchPaused, setIsTouchPaused] = useState(false)
    const lastTouchStart = useRef<number | null>(null)

    function handlePointerEnter(event: PointerEvent<T>) {
        if (event.pointerType === "mouse") {
            setIsPointerInside(true)
        }
    }

    function handlePointerLeave(event: PointerEvent<T>) {
        if (event.pointerType === "mouse") {
            setIsPointerInside(false)
        }
    }

    function handlePointerDown(event: PointerEvent<T>) {
        if (isTouchLike(event)) {
            lastTouchStart.current = performance.now()
        }
    }

    function handlePointerUp(event: PointerEvent<T>) {
        if (isTouchLike(event)) {
            setIsTouchPaused((current) => !current)
        }
    }

    function handleFocus() {
        const touchStart = lastTouchStart.current

        if (touchStart !== null && performance.now() - touchStart < TOUCH_FOCUS_WINDOW_MS) {
            return
        }

        setIsFocusInside(true)
    }

    function releaseTouchPause() {
        setIsTouchPaused(false)
    }

    function handleBlur(event: FocusEvent<T>) {
        const next = event.relatedTarget

        if (next instanceof Node && event.currentTarget.contains(next)) {
            return
        }

        setIsFocusInside(false)
    }

    const pauseProps = {
        onPointerEnter: handlePointerEnter,
        onPointerLeave: handlePointerLeave,
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerUp,
        onFocus: handleFocus,
        onBlur: handleBlur
    }

    return {
        isPaused: isPointerInside || isFocusInside || isTouchPaused,
        pauseProps,
        releaseTouchPause
    }
}

export default useHoverFocusPause
