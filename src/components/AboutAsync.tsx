import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import AsyncSection from "@/components/AsyncSection"

interface AboutAsyncProps {
    isLoading: boolean
    isError: boolean
    skeleton: ReactNode
    onRetry: () => void
    children: ReactNode
    errorId?: string
    announce?: boolean
}

function AboutAsync({
    isLoading,
    isError,
    skeleton,
    onRetry,
    children,
    errorId,
    announce = false
}: AboutAsyncProps) {
    const { t } = useTranslation("about")

    return (
        <AsyncSection
            isLoading={isLoading}
            isError={isError}
            skeleton={skeleton}
            error={{
                id: errorId,
                announce,
                title: t("loadError.message"),
                retryLabel: t("loadError.retry"),
                onRetry
            }}
        >
            {children}
        </AsyncSection>
    )
}

export default AboutAsync
