import type ContentSchema from "@/types/content/ContentSchema.types"

type Items = { items: string[] }

const itemsSchema: ContentSchema<Items> = {
    safeParse(data) {
        const items =
            typeof data === "object" && data !== null && "items" in data ? data.items : undefined

        if (!Array.isArray(items)) {
            return {
                success: false,
                error: {
                    issues: [{ path: ["items"], code: "invalid_type", message: "Expected array" }]
                }
            }
        }

        const issues = items.flatMap((item, index) =>
            typeof item === "string"
                ? []
                : [{ path: ["items", index], code: "invalid_type", message: "Expected string" }]
        )

        if (issues.length > 0) {
            return { success: false, error: { issues } }
        }

        return { success: true, data: { items: items.filter((item) => typeof item === "string") } }
    }
}

export default itemsSchema
