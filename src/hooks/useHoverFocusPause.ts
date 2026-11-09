import { useState } from "react"
import type { FocusEvent, PointerEvent } from "react"

function useHoverFocusPause<T extends HTMLElement>() {
    const [isPointerInside, setIsPointerInside] = useState(false)
    const [isFocusInside, setIsFocusInside] = useState(false)

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

    function handleFocus() {
        setIsFocusInside(true)
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
        onFocus: handleFocus,
        onBlur: handleBlur
    }

    return { isPaused: isPointerInside || isFocusInside, pauseProps }
}

export default useHoverFocusPause
