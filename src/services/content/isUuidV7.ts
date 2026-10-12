const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

function isUuidV7(value: unknown): value is string {
    return typeof value === "string" && UUID_V7_PATTERN.test(value)
}

export default isUuidV7
