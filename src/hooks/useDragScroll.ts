import { useRef } from "react"
import type { PointerEvent } from "react"

interface DragStart {
    pointerX: number
    scrollLeft: number
}

function useDragScroll<T extends HTMLElement>() {
    const ref = useRef<T>(null)
    const dragStart = useRef<DragStart | null>(null)

    function stopDragging(event: PointerEvent<T>) {
        const element = ref.current

        if (!element || !dragStart.current) {
            return
        }

        dragStart.current = null
        delete element.dataset.dragging

        if (element.hasPointerCapture(event.pointerId)) {
            element.releasePointerCapture(event.pointerId)
        }
    }

    function handlePointerDown(event: PointerEvent<T>) {
        const element = ref.current

        if (
            !element ||
            event.pointerType !== "mouse" ||
            event.button !== 0 ||
            getComputedStyle(element).overflowX !== "auto"
        ) {
            return
        }

        dragStart.current = { pointerX: event.clientX, scrollLeft: element.scrollLeft }
        element.setPointerCapture(event.pointerId)
        element.dataset.dragging = "true"
    }

    function handlePointerMove(event: PointerEvent<T>) {
        const element = ref.current

        if (!element || !dragStart.current) {
            return
        }

        element.scrollLeft =
            dragStart.current.scrollLeft - (event.clientX - dragStart.current.pointerX)
    }

    const dragProps = {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: stopDragging,
        onPointerCancel: stopDragging
    }

    return { ref, dragProps }
}

export default useDragScroll
