import { useTranslation } from "react-i18next"
import Chip from "@/components/Chip"
import type Certificate from "@/types/timeline/Certificate.types"

interface CertificateChipProps {
    certificate: Certificate
    onDark?: boolean
}

function CertificateChip({ certificate, onDark = false }: CertificateChipProps) {
    const { t } = useTranslation("common")

    return (
        <Chip onDark={onDark}>
            {certificate.name}
            {certificate.issuer && (
                <>
                    <span aria-hidden="true"> {t("symbols.separator")} </span>
                    {certificate.issuer}
                </>
            )}
        </Chip>
    )
}

export default CertificateChip
