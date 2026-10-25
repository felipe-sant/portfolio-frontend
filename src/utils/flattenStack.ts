import STACK_CATEGORIES from "@/enum/stackCategories.enum"
import type StackGroup from "@/types/content/StackGroup.types"
import type StackEntry from "@/types/home/StackEntry.types"

function flattenStack(groups: StackGroup[]): StackEntry[] {
    return STACK_CATEGORIES.flatMap((category) =>
        groups
            .filter((group) => group.category === category)
            .flatMap((group) =>
                group.items.map((item) => ({ name: item.name, isPrimary: item.isPrimary === true }))
            )
    )
}

export default flattenStack
