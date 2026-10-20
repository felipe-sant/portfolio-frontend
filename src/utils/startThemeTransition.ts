import getSystemMotion from "@/utils/getSystemMotion"
import readStoredMotion from "@/utils/readStoredMotion"

const ATTRIBUTE = "data-theme-transition"
const FALLBACK_DURATION_MS = 180

let pendingTimeout: ReturnType<typeof setTimeout> | undefined

function readDuration(root: HTMLElement) {
    const raw = getComputedStyle(root).getPropertyValue("--dur-base").trim()
    const value = Number.parseFloat(raw)

    if (Number.isNaN(value)) {
        return FALLBACK_DURATION_MS
    }

    return raw.endsWith("ms") ? value : value * 1000
}

function startThemeTransition() {
    if ((readStoredMotion() ?? getSystemMotion()) === "reduced") {
        return
    }

    const root = document.documentElement

    clearTimeout(pendingTimeout)
    root.setAttribute(ATTRIBUTE, "")
    pendingTimeout = setTimeout(() => {
        root.removeAttribute(ATTRIBUTE)
    }, readDuration(root))
}

export default startThemeTransition
