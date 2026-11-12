const DAY_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

function formatMonthYear(day: string): string | undefined {
    const match = DAY_PATTERN.exec(day)

    if (match === null) {
        return undefined
    }

    return `${match[2]}/${match[1]}`
}

export default formatMonthYear
