import { useId } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import Flag from "@/components/Flag"
import Icon from "@/components/Icon"
import useDropdown from "@/hooks/useDropdown"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import getEquivalentPath from "@/i18n/getEquivalentPath"
import getLanguageFromPath from "@/i18n/getLanguageFromPath"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import setLanguage from "@/i18n/setLanguage"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import dropdown from "@/styles/components/dropdownPanel.module.css"
import css from "@/styles/components/languageSelector.module.css"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

interface LanguageSelectorProps {
    variant?: "inline" | "block"
}

interface LanguageOptionProps {
    language: SupportedLanguage
    to: string
    isActive: boolean
    onSelect: (language: SupportedLanguage) => void
}

const LANGUAGE_KEYS = {
    "pt-BR": "ptBR",
    en: "en",
    es: "es"
} as const

function LanguageOption({ language, to, isActive, onSelect }: LanguageOptionProps) {
    const { t } = useTranslation()

    return (
        <li>
            <Link
                to={to}
                hrefLang={language}
                lang={language}
                aria-current={isActive ? "true" : undefined}
                preventScrollReset
                className={`${css.option} ${isActive ? css.active : ""}`}
                onClick={() => onSelect(language)}
            >
                <Flag language={language} />
                <span>{t(`languageSelector.${LANGUAGE_KEYS[language]}.name`)}</span>
            </Link>
        </li>
    )
}

function LanguageSelector({ variant = "inline" }: LanguageSelectorProps) {
    const { t, i18n } = useTranslation()
    const { pathname, search, hash } = useLocation()
    const { isOpen, isMounted, close, toggle, containerRef, buttonRef, panelProps } = useDropdown()
    const listId = useId()
    const activeLanguage =
        getLanguageFromPath(pathname) ??
        resolveSupportedLanguage(i18n.resolvedLanguage) ??
        FALLBACK_LANGUAGE

    function select(language: SupportedLanguage) {
        void setLanguage(language)
        close()
        buttonRef.current?.focus()
    }

    return (
        <div
            ref={containerRef}
            className={`${css.selector} ${variant === "block" ? css.block : ""}`}
        >
            <button
                ref={buttonRef}
                type="button"
                className={css.toggle}
                aria-expanded={isOpen}
                aria-controls={isMounted ? listId : undefined}
                aria-label={t("languageSelector.current", {
                    name: t(`languageSelector.${LANGUAGE_KEYS[activeLanguage]}.name`)
                })}
                onClick={toggle}
            >
                <Flag language={activeLanguage} />
                <Icon name="chevronDown" size={16} />
            </button>
            {isMounted && (
                <ul id={listId} className={`${css.list} ${dropdown.panel}`} {...panelProps}>
                    {SUPPORTED_LANGUAGES.map((language) => (
                        <LanguageOption
                            key={language}
                            language={language}
                            to={`${getEquivalentPath(pathname, language)}${search}${hash}`}
                            isActive={language === activeLanguage}
                            onSelect={select}
                        />
                    ))}
                </ul>
            )}
        </div>
    )
}

export default LanguageSelector
