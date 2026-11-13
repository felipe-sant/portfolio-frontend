import { useCallback, useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import type TimelineItem from "@/types/timeline/TimelineItem.types"

type SelectedItem = {
    item: TimelineItem
    pathname: string
}

function useTrajectorySelection() {
    const { pathname } = useLocation()
    const [selected, setSelected] = useState<SelectedItem | null>(null)
    const triggers = useRef(new Map<string, HTMLButtonElement>())
    const itemToFocus = useRef<string | null>(null)

    if (selected && selected.pathname !== pathname) {
        setSelected(null)
    }

    const selectedItem = selected && selected.pathname === pathname ? selected.item : null

    useEffect(() => {
        if (selectedItem === null && itemToFocus.current !== null) {
            triggers.current.get(itemToFocus.current)?.focus()
            itemToFocus.current = null
        }
    }, [selectedItem])

    function open(item: TimelineItem) {
        itemToFocus.current = item.id
        setSelected({ item, pathname })
    }

    function close() {
        setSelected(null)
    }

    const registerTrigger = useCallback(
        (id: string) => (element: HTMLButtonElement | null) => {
            if (element) {
                triggers.current.set(id, element)
            } else {
                triggers.current.delete(id)
            }
        },
        []
    )

    return { selectedItem, open, close, registerTrigger }
}

export default useTrajectorySelection
