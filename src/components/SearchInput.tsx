import { useId, useRef } from "react"
import { useTranslation } from "react-i18next"
import css from "@/styles/components/searchInput.module.css"
import Icon from "@/components/Icon"
import VisuallyHidden from "@/components/VisuallyHidden"

interface SearchInputProps {
    value: string
    onChange: (value: string) => void
    onClear: () => void
    label: string
    placeholder?: string
    maxLength?: number
    name?: string
    id?: string
}

function SearchInput({
    value,
    onChange,
    onClear,
    label,
    placeholder,
    maxLength,
    name,
    id
}: SearchInputProps) {
    const { t } = useTranslation()
    const generatedId = useId()
    const inputId = id ?? generatedId
    const inputRef = useRef<HTMLInputElement>(null)

    function handleClear() {
        onClear()
        inputRef.current?.focus()
    }

    return (
        <div className={css.wrapper}>
            <label htmlFor={inputId}>
                <VisuallyHidden>{label}</VisuallyHidden>
            </label>
            <input
                ref={inputRef}
                id={inputId}
                type="search"
                name={name}
                className={css.input}
                value={value}
                placeholder={placeholder}
                maxLength={maxLength}
                onChange={(event) => onChange(event.target.value)}
            />
            {value === "" ? (
                <span className={css.icon}>
                    <Icon name="search" size={18} />
                </span>
            ) : (
                <button
                    type="button"
                    className={css.clear}
                    aria-label={t("searchInput.clear")}
                    onClick={handleClear}
                >
                    <Icon name="close" size={12} />
                </button>
            )}
        </div>
    )
}

export default SearchInput
