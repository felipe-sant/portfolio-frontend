import { array, boolean, enum as enumeration, object, optional, string } from "zod/mini"
import STACK_CATEGORIES from "@/enum/stackCategories.enum"
import type StackGroup from "@/types/content/StackGroup.types"
import type { ZodMiniType } from "zod/mini"

const stackGroupSchema: ZodMiniType<StackGroup> = object({
    category: enumeration(STACK_CATEGORIES),
    items: array(
        object({
            name: string(),
            isPrimary: optional(boolean()),
            isProgrammingLanguage: optional(boolean())
        })
    )
})

export default stackGroupSchema
