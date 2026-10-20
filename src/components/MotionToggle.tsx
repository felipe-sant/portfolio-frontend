import { useTranslation } from "react-i18next"
import Icon from "@/components/Icon"
import IconButton from "@/components/IconButton"
import useMotion from "@/hooks/useMotion"
import css from "@/styles/components/themeToggle.module.css"

interface MotionToggleProps {
    variant?: "icon" | "labeled"
}

function MotionToggle({ variant = "icon" }: MotionToggleProps) {
    const { t } = useTranslation()
    const { motion, toggleMotion } = useMotion()
    const isReduced = motion === "reduced"

    if (variant === "icon") {
        return (
            <IconButton
                icon="motion"
                label={t("motionToggle.label")}
                aria-pressed={isReduced}
                onClick={toggleMotion}
            />
        )
    }

    return (
        <button
            type="button"
            className={css.labeled}
            aria-pressed={isReduced}
            onClick={toggleMotion}
        >
            <Icon name="motion" size={20} />
            {t("motionToggle.label")}
        </button>
    )
}

export default MotionToggle
