import STACK_CATEGORIES from "@/enum/stackCategories.enum"
import type StackGroup from "@/types/content/StackGroup.types"

function sortStackGroups(groups: StackGroup[]): StackGroup[] {
    return STACK_CATEGORIES.flatMap((category) =>
        groups.filter((group) => group.category === category && group.items.length > 0)
    )
}

export default sortStackGroups
