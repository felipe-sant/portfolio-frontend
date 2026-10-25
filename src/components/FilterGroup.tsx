import css from "@/styles/components/filterGroup.module.css"

interface FilterOption {
    value: string
    label: string
}

interface FilterGroupProps {
    label: string
    options: FilterOption[]
    value: string | undefined
    onChange: (value: string) => void
}

function FilterGroup({ label, options, value, onChange }: FilterGroupProps) {
    return (
        <div className={css.group} role={"group"} aria-label={label}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    className={css.button}
                    aria-pressed={option.value === value}
                    onClick={() => onChange(option.value)}
                    onFocus={(event) =>
                        event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })
                    }
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}

export default FilterGroup
