import { useId } from "react"
import { useTranslation } from "react-i18next"
import IconButton from "@/components/IconButton"
import MotionToggle from "@/components/MotionToggle"
import ThemeToggle from "@/components/ThemeToggle"
import useDropdown from "@/hooks/useDropdown"
import dropdown from "@/styles/components/dropdownPanel.module.css"
import css from "@/styles/components/settingsMenu.module.css"

function SettingsMenu() {
    const { t } = useTranslation()
    const { isOpen, isMounted, toggle, containerRef, buttonRef, panelProps } = useDropdown()
    const panelId = useId()
    const preferencesId = useId()
    const accessibilityId = useId()

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
                <div id={panelId} className={`${css.panel} ${dropdown.panel}`} {...panelProps}>
                    <div role={"group"} aria-labelledby={preferencesId} className={css.group}>
                        <p id={preferencesId} className={css.title}>
                            {t("settings.preferences")}
                        </p>
                        <ThemeToggle variant="labeled" />
                    </div>
                    <div role={"group"} aria-labelledby={accessibilityId} className={css.group}>
                        <p id={accessibilityId} className={css.title}>
                            {t("settings.accessibility")}
                        </p>
                        <MotionToggle variant="labeled" />
                    </div>
                </div>
            )}
        </div>
    )
}

export default SettingsMenu
