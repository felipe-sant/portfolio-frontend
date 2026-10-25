import { useId, useState } from "react"
import { useTranslation } from "react-i18next"
import Button from "@/components/Button"
import Modal from "@/components/Modal"
import css from "@/styles/components/projectsFiltersModal.module.css"
import type ProjectFilterOption from "@/types/project/ProjectFilterOption.types"
import type ProjectSort from "@/types/project/ProjectSort.types"
import type ProjectsAppliedFilters from "@/types/project/ProjectsAppliedFilters.types"
import defaultProjectSort from "@/utils/defaultProjectSort"
import toTechnologyKey from "@/utils/toTechnologyKey"

type SortOption = {
    value: ProjectSort
    label: string
}

interface ProjectsFiltersModalProps {
    isOpen: boolean
    sorts: readonly SortOption[]
    technologies: ProjectFilterOption[]
    years: ProjectFilterOption[]
    applied: ProjectsAppliedFilters
    onApply: (next: ProjectsAppliedFilters) => void
    onClose: () => void
}

interface FilterSectionProps {
    legend: string
    options: ProjectFilterOption[]
    isChecked: (option: string) => boolean
    onToggle: (option: string) => void
}

interface FilterOptionProps {
    option: ProjectFilterOption
    isChecked: boolean
    onToggle: (option: string) => void
}

function FilterOption({ option, isChecked, onToggle }: FilterOptionProps) {
    const { t } = useTranslation("projects")
    const isDisabled = option.count === 0 && !isChecked

    return (
        <label className={css.chip}>
            <input
                type="checkbox"
                className={css.input}
                checked={isChecked}
                disabled={isDisabled}
                aria-label={
                    isDisabled ? `${option.value} ${t("filters.modal.noProjects")}` : undefined
                }
                onChange={() => onToggle(option.value)}
            />
            <span className={css.text}>{option.value}</span>
        </label>
    )
}

function FilterSection({ legend, options, isChecked, onToggle }: FilterSectionProps) {
    if (options.length === 0) {
        return null
    }

    return (
        <fieldset className={css.section}>
            <legend className={css.legend}>{legend}</legend>
            <div className={css.options}>
                {options.map((option) => (
                    <FilterOption
                        key={option.value}
                        option={option}
                        isChecked={isChecked(option.value)}
                        onToggle={onToggle}
                    />
                ))}
            </div>
        </fieldset>
    )
}

interface SortSectionProps {
    legend: string
    options: readonly SortOption[]
    value: ProjectSort
    onChange: (sort: ProjectSort) => void
}

function SortSection({ legend, options, value, onChange }: SortSectionProps) {
    const name = useId()

    return (
        <fieldset className={css.section}>
            <legend className={css.legend}>{legend}</legend>
            <div className={css.options}>
                {options.map((option) => (
                    <label key={option.value} className={css.chip}>
                        <input
                            type="radio"
                            name={name}
                            className={css.input}
                            checked={value === option.value}
                            onChange={() => onChange(option.value)}
                        />
                        <span className={css.text}>{option.label}</span>
                    </label>
                ))}
            </div>
        </fieldset>
    )
}

function isSameSelection(first: string[], second: string[]): boolean {
    return (
        first.length === second.length &&
        first.toSorted().join("\n") === second.toSorted().join("\n")
    )
}

function ProjectsFiltersDialog({
    sorts,
    technologies,
    years,
    applied,
    onApply,
    onClose
}: Omit<ProjectsFiltersModalProps, "isOpen">) {
    const { t } = useTranslation("projects")
    const summaryId = useId()
    const [draft, setDraft] = useState<ProjectsAppliedFilters>(applied)
    const count = draft.tech.length + draft.year.length

    function toggleTechnology(option: string) {
        const key = toTechnologyKey(option)
        const isSelected = draft.tech.some((value) => toTechnologyKey(value) === key)

        setDraft({
            ...draft,
            tech: isSelected
                ? draft.tech.filter((value) => toTechnologyKey(value) !== key)
                : [...draft.tech, option]
        })
    }

    function toggleYear(option: string) {
        setDraft({
            ...draft,
            year: draft.year.includes(option)
                ? draft.year.filter((value) => value !== option)
                : [...draft.year, option]
        })
    }

    function finish() {
        const hasChanged =
            !isSameSelection(draft.tech, applied.tech) ||
            !isSameSelection(draft.year, applied.year) ||
            draft.sort !== applied.sort

        if (hasChanged) {
            onApply(draft)
        }

        onClose()
    }

    return (
        <Modal
            isOpen
            title={t("filters.modal.title")}
            closeLabel={t("filters.modal.close")}
            onClose={finish}
            description={summaryId}
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={() => setDraft({ tech: [], year: [], sort: defaultProjectSort })}
                    >
                        {t("filters.modal.clear")}
                    </Button>
                    <Button onClick={finish}>{t("filters.modal.apply")}</Button>
                </>
            }
        >
            <p id={summaryId} className={css.summary}>
                {count === 0
                    ? t("filters.modal.summaryNone")
                    : t("filters.modal.summary", { count })}
            </p>
            <SortSection
                legend={t("sort.label")}
                options={sorts}
                value={draft.sort}
                onChange={(sort) => setDraft({ ...draft, sort })}
            />
            <FilterSection
                legend={t("filters.modal.technology")}
                options={technologies}
                isChecked={(option) =>
                    draft.tech.some((value) => toTechnologyKey(value) === toTechnologyKey(option))
                }
                onToggle={toggleTechnology}
            />
            <FilterSection
                legend={t("filters.modal.year")}
                options={years}
                isChecked={(option) => draft.year.includes(option)}
                onToggle={toggleYear}
            />
        </Modal>
    )
}

function ProjectsFiltersModal({ isOpen, ...rest }: ProjectsFiltersModalProps) {
    return isOpen ? <ProjectsFiltersDialog {...rest} /> : null
}

export default ProjectsFiltersModal
