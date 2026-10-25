import { useTranslation } from "react-i18next"
import css from "@/styles/components/skipLink.module.css"

interface SkipLinkProps {
    targetId: string
    inert?: boolean
}

function SkipLink({ targetId, inert }: SkipLinkProps) {
    const { t } = useTranslation()

    return (
        <a href={`#${targetId}`} className={css.skipLink} inert={inert}>
            {t("skipToContent")}
        </a>
    )
}

export default SkipLink
