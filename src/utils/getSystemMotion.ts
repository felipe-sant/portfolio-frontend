import type Motion from "@/types/motion/Motion.types"

function getSystemMotion(): Motion {
    if (typeof window.matchMedia !== "function") {
        return "full"
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "full"
}

export default getSystemMotion
