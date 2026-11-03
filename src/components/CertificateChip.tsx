import { useTranslation } from "react-i18next"
import Chip from "@/components/Chip"
import css from "@/styles/components/certificateChip.module.css"
import type Certificate from "@/types/timeline/Certificate.types"

interface CertificateChipProps {
    certificate: Certificate
}

function CertificateChip({ certificate }: CertificateChipProps) {
    const { t } = useTranslation("common")
    const separator = ` ${t("symbols.separator")} `

    return (
        <Chip>
            {certificate.name}
            {certificate.issuer && (
                <>
                    <span className={css.separator} aria-hidden="true">
                        {separator}
                    </span>
                    {certificate.issuer}
                </>
            )}
        </Chip>
    )
}

export default CertificateChip
