import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import VisuallyHidden from "@/components/VisuallyHidden"
import getEquivalentPath from "@/i18n/getEquivalentPath"
import getLanguageFromPath from "@/i18n/getLanguageFromPath"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import setLanguage from "@/i18n/setLanguage"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import css from "@/styles/components/languageSelector.module.css"

interface LanguageSelectorProps {
    variant?: "inline" | "block"
}

const NAME_SEPARATOR = " "

const LANGUAGE_KEYS = {
    "pt-BR": "ptBR",
    en: "en",
    es: "es"
} as const

function LanguageSelector({ variant = "inline" }: LanguageSelectorProps) {
    const { t, i18n } = useTranslation()
    const { pathname, search, hash } = useLocation()
    const activeLanguage =
        getLanguageFromPath(pathname) ?? resolveSupportedLanguage(i18n.resolvedLanguage)

    return (
        <fieldset className={`${css.selector} ${css[variant]}`}>
            <VisuallyHidden as="legend">{t("languageSelector.label")}</VisuallyHidden>
            {SUPPORTED_LANGUAGES.map((language, index) => {
                const key = LANGUAGE_KEYS[language]
                const isActive = language === activeLanguage

                return (
                    <Fragment key={language}>
                        {index > 0 && variant === "inline" && (
                            <span aria-hidden="true">{t("symbols.separator")}</span>
                        )}
                        <Link
                            to={`${getEquivalentPath(pathname, language)}${search}${hash}`}
                            hrefLang={language}
                            lang={language}
                            aria-current={isActive ? "true" : undefined}
                            preventScrollReset
                            className={`${css.option} ${isActive ? css.active : ""}`}
                            onClick={() => {
                                void setLanguage(language)
                            }}
                        >
                            <span>{t(`languageSelector.${key}.short`)}</span>
                            {NAME_SEPARATOR}
                            <VisuallyHidden>{t(`languageSelector.${key}.name`)}</VisuallyHidden>
                        </Link>
                    </Fragment>
                )
            })}
        </fieldset>
    )
}

export default LanguageSelector
