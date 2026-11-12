import { lazy, Suspense, useState } from "react"

const ResumeModal = lazy(() => import("@/components/ResumeModal"))

interface LazyResumeModalProps {
    isOpen: boolean
    onClose: () => void
}

function LazyResumeModal({ isOpen, onClose }: LazyResumeModalProps) {
    const [hasOpened, setHasOpened] = useState(isOpen)

    if (isOpen && !hasOpened) {
        setHasOpened(true)
    }

    if (!hasOpened && !isOpen) {
        return null
    }

    return (
        <Suspense fallback={null}>
            <ResumeModal isOpen={isOpen} onClose={onClose} />
        </Suspense>
    )
}

export default LazyResumeModal
