import type StackCategory from "@/types/content/StackCategory.types"
import type StackItem from "@/types/content/StackItem.types"

type StackGroup = {
    category: StackCategory
    items: StackItem[]
}

export default StackGroup
