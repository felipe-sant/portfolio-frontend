import { useId } from "react"
import { useTranslation } from "react-i18next"
import IconButton from "@/components/IconButton"
import MotionToggle from "@/components/MotionToggle"
import ThemeToggle from "@/components/ThemeToggle"
import useDropdown from "@/hooks/useDropdown"
import css from "@/styles/components/settingsMenu.module.css"

function SettingsMenu() {
    const { t } = useTranslation()
    const { isOpen, isMounted, toggle, containerRef, buttonRef, panelProps } = useDropdown()
    const panelId = useId()

    return (
        <div ref={containerRef} className={css.menu}>
            <IconButton
                ref={buttonRef}
                icon="settings"
                label={t("settings.label")}
                aria-expanded={isOpen}
                aria-controls={isMounted ? panelId : undefined}
                onClick={toggle}
            />
            {isMounted && (
                <div id={panelId} className={css.panel} {...panelProps}>
                    <ThemeToggle variant="labeled" />
                    <MotionToggle variant="labeled" />
                </div>
            )}
        </div>
    )
}

export default SettingsMenu
