import MOTIONS from "@/enum/motions.enum"
import type Motion from "@/types/motion/Motion.types"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

function readStoredMotion(): Motion | undefined {
    try {
        const stored = localStorage.getItem(MOTION_STORAGE_KEY)

        return MOTIONS.find((motion) => motion === stored)
    } catch {
        return undefined
    }
}

export default readStoredMotion
