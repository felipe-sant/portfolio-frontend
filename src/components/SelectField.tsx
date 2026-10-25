import css from "@/styles/components/selectField.module.css"

interface SelectOption {
    value: string
    label: string
}

interface SelectFieldProps {
    label: string
    options: SelectOption[]
    value: string
    onChange: (value: string) => void
}

function SelectField({ label, options, value, onChange }: SelectFieldProps) {
    return (
        <label className={css.field}>
            <span className={css.label}>{label}</span>
            <select
                className={css.select}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    )
}

export default SelectField
