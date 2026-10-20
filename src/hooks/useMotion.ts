import { useCallback, useEffect, useSyncExternalStore } from "react"
import type Motion from "@/types/motion/Motion.types"
import applyMotion from "@/utils/applyMotion"
import getSystemMotion from "@/utils/getSystemMotion"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"
import readStoredMotion from "@/utils/readStoredMotion"
import saveMotion from "@/utils/saveMotion"

const SYSTEM_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

const listeners = new Set<() => void>()

function notifyListeners() {
    listeners.forEach((listener) => listener())
}

function subscribe(onChange: () => void) {
    listeners.add(onChange)

    const mediaQuery =
        typeof window.matchMedia === "function" ? window.matchMedia(SYSTEM_MOTION_QUERY) : undefined
    const handleStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === MOTION_STORAGE_KEY) {
            onChange()
        }
    }

    mediaQuery?.addEventListener("change", onChange)
    window.addEventListener("storage", handleStorage)

    return () => {
        listeners.delete(onChange)
        mediaQuery?.removeEventListener("change", onChange)
        window.removeEventListener("storage", handleStorage)
    }
}

function getSnapshot(): Motion {
    return readStoredMotion() ?? getSystemMotion()
}

function getServerSnapshot(): Motion {
    return "full"
}

function useMotion() {
    const motion = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    useEffect(() => {
        applyMotion(motion)
    }, [motion])

    const setMotion = useCallback((next: Motion) => {
        saveMotion(next)
        notifyListeners()
    }, [])

    const toggleMotion = useCallback(() => {
        setMotion(getSnapshot() === "reduced" ? "full" : "reduced")
    }, [setMotion])

    return { motion, setMotion, toggleMotion }
}

export default useMotion
