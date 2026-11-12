type ContentSchemaIssue = {
    path: PropertyKey[]
    code: string
    message: string
}

type ContentSchema<T> = {
    safeParse(
        data: unknown
    ):
        | { success: true; data: T; error?: undefined }
        | { success: false; data?: undefined; error: { issues: ContentSchemaIssue[] } }
}

export default ContentSchema
