import { useId } from "react"
import css from "@/styles/components/radioChipGroup.module.css"

interface RadioChipOption<Value extends string> {
    value: Value
    label: string
}

interface RadioChipGroupProps<Value extends string> {
    legend: string
    options: readonly RadioChipOption<Value>[]
    value: Value
    onChange: (value: Value) => void
    name?: string
    disabled?: boolean
    className?: string
}

function RadioChipGroup<Value extends string>({
    legend,
    options,
    value,
    onChange,
    name,
    disabled,
    className
}: RadioChipGroupProps<Value>) {
    const generatedName = useId()

    return (
        <fieldset className={className ? `${css.section} ${className}` : css.section}>
            <legend className={css.legend}>{legend}</legend>
            <div className={css.options}>
                {options.map((option) => (
                    <label key={option.value} className={css.chip}>
                        <input
                            type="radio"
                            name={name ?? generatedName}
                            className={css.input}
                            checked={value === option.value}
                            disabled={disabled}
                            onChange={() => onChange(option.value)}
                        />
                        <span className={css.text}>{option.label}</span>
                    </label>
                ))}
            </div>
        </fieldset>
    )
}

export default RadioChipGroup
