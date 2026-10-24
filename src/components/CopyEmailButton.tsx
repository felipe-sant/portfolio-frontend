import { useTranslation } from "react-i18next"
import Button from "@/components/Button"
import VisuallyHidden from "@/components/VisuallyHidden"
import useCopyToClipboard from "@/hooks/useCopyToClipboard"
import css from "@/styles/components/copyEmailButton.module.css"

interface CopyEmailButtonProps {
    email: string
}

function CopyEmailButton({ email }: CopyEmailButtonProps) {
    const { t } = useTranslation()
    const { status, copy } = useCopyToClipboard()
    const label = t(`footer.copyEmail.${status}`)
    const announcement = status === "idle" ? "" : label

    return (
        <span className={css.wrapper}>
            <Button variant="secondary" icon="copy" onClick={() => copy(email)}>
                {label}
            </Button>
            <VisuallyHidden role={"status"}>{announcement}</VisuallyHidden>
        </span>
    )
}

export default CopyEmailButton
