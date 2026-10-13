const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

function isValidMonth(value: unknown): value is string {
    return typeof value === "string" && MONTH_PATTERN.test(value)
}

export default isValidMonth
