import { useTranslation } from "react-i18next"
import STACK_CATEGORIES from "@/enum/stackCategories.enum"
import css from "@/styles/components/projectStack.module.css"
import type StackGroup from "@/types/content/StackGroup.types"

interface ProjectStackProps {
    stack: StackGroup[]
}

function ProjectStack({ stack }: ProjectStackProps) {
    const { t } = useTranslation(["project", "common"])
    const groups = STACK_CATEGORIES.map((category) => ({
        category,
        items: stack.filter((group) => group.category === category).flatMap((group) => group.items)
    })).filter((group) => group.items.length > 0)

    if (groups.length === 0) {
        return null
    }

    return (
        <section className={css.stack}>
            <h2 className={css.heading}>{t("project:stack.heading")}</h2>
            {groups.map((group) => (
                <div key={group.category} className={css.group}>
                    <h3 className={css.category}>{t(`common:stackCategory.${group.category}`)}</h3>
                    <ul className={css.items}>
                        {group.items.map((item) => (
                            <li key={item.name}>{item.name}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </section>
    )
}

export default ProjectStack
