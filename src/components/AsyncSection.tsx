import type { ComponentProps, ReactNode } from "react"
import LoadError from "@/components/LoadError"
import SkeletonSwap from "@/components/SkeletonSwap"

interface AsyncSectionProps {
    isLoading: boolean
    isError: boolean
    skeleton: ReactNode
    error: ComponentProps<typeof LoadError>
    children: ReactNode
}

function AsyncSection({ isLoading, isError, skeleton, error, children }: AsyncSectionProps) {
    return (
        <SkeletonSwap isLoading={isLoading} skeleton={skeleton}>
            {isError && <LoadError {...error} />}
            {children}
        </SkeletonSwap>
    )
}

export default AsyncSection
