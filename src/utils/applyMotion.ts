import type Motion from "@/types/motion/Motion.types"

function applyMotion(motion: Motion): void {
    document.documentElement.setAttribute("data-motion", motion)
}

export default applyMotion
