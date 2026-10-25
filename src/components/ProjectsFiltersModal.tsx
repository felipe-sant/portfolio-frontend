import { useId, useState } from "react"
import { useTranslation } from "react-i18next"
import Button from "@/components/Button"
import Modal from "@/components/Modal"
import css from "@/styles/components/projectsFiltersModal.module.css"
import type ProjectsAppliedFilters from "@/types/project/ProjectsAppliedFilters.types"
import toTechnologyKey from "@/utils/toTechnologyKey"

interface ProjectsFiltersModalProps {
    isOpen: boolean
    technologies: string[]
    years: string[]
    applied: ProjectsAppliedFilters
    onApply: (next: ProjectsAppliedFilters) => void
    onClose: () => void
}

interface FilterSectionProps {
    legend: string
    options: string[]
    isChecked: (option: string) => boolean
    onToggle: (option: string) => void
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
                    <label key={option} className={css.chip}>
                        <input
                            type="checkbox"
                            className={css.input}
                            checked={isChecked(option)}
                            onChange={() => onToggle(option)}
                        />
                        <span className={css.text}>{option}</span>
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
            !isSameSelection(draft.tech, applied.tech) || !isSameSelection(draft.year, applied.year)

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
                    <Button variant="ghost" onClick={() => setDraft({ tech: [], year: [] })}>
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
