import { useCallback, useEffect, useId, useRef } from "react"
import type { KeyboardEvent } from "react"
import Icon from "@/components/Icon"
import useDropdown from "@/hooks/useDropdown"
import dropdown from "@/styles/components/dropdownPanel.module.css"
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
    const { isOpen, isMounted, close, toggle, containerRef, buttonRef, panelProps } = useDropdown()
    const listRef = useRef<HTMLUListElement>(null)
    const baseId = useId()
    const labelId = `${baseId}-label`
    const triggerId = `${baseId}-trigger`
    const listId = `${baseId}-list`
    const current = options.find((option) => option.value === value)

    const focusOption = useCallback((index: number) => {
        const items = listRef.current?.querySelectorAll<HTMLElement>("li")
        items?.[index]?.focus()
    }, [])

    useEffect(() => {
        if (!isOpen) {
            return
        }

        const list = listRef.current
        const selected = list?.querySelector<HTMLElement>('[aria-selected="true"]')
        const target = selected ?? list?.querySelector<HTMLElement>("li")
        target?.focus()
    }, [isOpen])

    function choose(optionValue: string) {
        if (optionValue !== value) {
            onChange(optionValue)
        }

        close()
        buttonRef.current?.focus()
    }

    function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if ((event.key === "ArrowDown" || event.key === "ArrowUp") && !isOpen) {
            event.preventDefault()
            toggle()
        }
    }

    function handleOptionKeyDown(event: KeyboardEvent<HTMLLIElement>, index: number) {
        const lastIndex = options.length - 1
        const targets: Record<string, number> = {
            ArrowDown: Math.min(index + 1, lastIndex),
            ArrowUp: Math.max(index - 1, 0),
            Home: 0,
            End: lastIndex
        }

        if (event.key in targets) {
            event.preventDefault()
            focusOption(targets[event.key])
            return
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            choose(options[index].value)
            return
        }

        if (event.key === "Tab") {
            buttonRef.current?.focus()
            close()
        }
    }

    return (
        <div ref={containerRef} className={css.field}>
            <span id={labelId} className={css.label}>
                {label}
            </span>
            <button
                ref={buttonRef}
                id={triggerId}
                type="button"
                className={css.trigger}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={isMounted ? listId : undefined}
                aria-labelledby={`${labelId} ${triggerId}`}
                onClick={toggle}
                onKeyDown={handleTriggerKeyDown}
            >
                <span>{current?.label}</span>
                <Icon name="chevronDown" size={16} />
            </button>
            {isMounted && (
                <ul
                    ref={listRef}
                    id={listId}
                    role={"listbox"}
                    aria-labelledby={labelId}
                    className={`${css.list} ${dropdown.panel}`}
                    {...panelProps}
                >
                    {options.map((option, index) => (
                        <li
                            key={option.value}
                            id={`${listId}-${index}`}
                            role={"option"}
                            tabIndex={-1}
                            aria-selected={option.value === value}
                            className={`${css.option} ${option.value === value ? css.active : ""}`}
                            onClick={() => choose(option.value)}
                            onKeyDown={(event) => handleOptionKeyDown(event, index)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default SelectField
