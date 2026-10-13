import type StackGroup from "@/types/content/StackGroup.types"

function getProjectTechnologies(stack: StackGroup[]): string[] {
    return stack.flatMap((group) => group.items.map((item) => item.name))
}

export default getProjectTechnologies
