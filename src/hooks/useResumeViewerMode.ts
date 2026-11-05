import useMediaQuery from "@/hooks/useMediaQuery"
import type ResumeViewerMode from "@/types/resume/ResumeViewerMode.types"

function useResumeViewerMode(): ResumeViewerMode {
    const hasCoarsePointer = useMediaQuery("(pointer: coarse)")
    const hasNoViewer = typeof navigator !== "undefined" && navigator.pdfViewerEnabled === false

    return hasNoViewer || hasCoarsePointer ? "canvas" : "native"
}

export default useResumeViewerMode
