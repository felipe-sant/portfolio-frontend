import { useTranslation } from "react-i18next"
import Icon from "@/components/Icon"
import IconButton from "@/components/IconButton"
import useTheme from "@/hooks/useTheme"
import css from "@/styles/components/themeToggle.module.css"

interface ThemeToggleProps {
    variant?: "icon" | "labeled"
}

function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
    const { t } = useTranslation()
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === "dark"

    if (variant === "icon") {
        return (
            <IconButton
                icon={isDark ? "sun" : "moon"}
                label={t("themeToggle.label")}
                aria-pressed={isDark}
                onClick={toggleTheme}
            />
        )
    }

    return (
        <button type="button" className={css.labeled} aria-pressed={isDark} onClick={toggleTheme}>
            <Icon name={isDark ? "sun" : "moon"} size={20} />
            {t("themeToggle.label")}
        </button>
    )
}

export default ThemeToggle
