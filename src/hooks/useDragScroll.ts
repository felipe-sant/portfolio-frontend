import { useRef } from "react"
import type { PointerEvent } from "react"

const DRAG_THRESHOLD = 4

interface DragStart {
    isDragging: boolean
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

        const wasDragging = dragStart.current.isDragging

        dragStart.current = null

        if (!wasDragging) {
            return
        }

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

        dragStart.current = {
            isDragging: false,
            pointerX: event.clientX,
            scrollLeft: element.scrollLeft
        }
    }

    function handlePointerMove(event: PointerEvent<T>) {
        const element = ref.current

        if (!element || !dragStart.current) {
            return
        }

        if (event.buttons === 0) {
            stopDragging(event)
            dragStart.current = null
            return
        }

        const distance = event.clientX - dragStart.current.pointerX

        if (!dragStart.current.isDragging) {
            if (Math.abs(distance) < DRAG_THRESHOLD) {
                return
            }

            dragStart.current.isDragging = true
            element.setPointerCapture(event.pointerId)
            element.dataset.dragging = "true"
        }

        element.scrollLeft = dragStart.current.scrollLeft - distance
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
