import type Motion from "@/types/motion/Motion.types"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

function saveMotion(motion: Motion): void {
    try {
        localStorage.setItem(MOTION_STORAGE_KEY, motion)
    } catch {
        return
    }
}

export default saveMotion
