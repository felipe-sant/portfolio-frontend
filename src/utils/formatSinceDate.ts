import type SinceDate from "@/types/home/SinceDate.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function formatSinceDate(start: string, language: SupportedLanguage): SinceDate {
    const [year, month] = start.split("-").map(Number)
    const parts = new Intl.DateTimeFormat(language, {
        month: "numeric",
        year: "numeric",
        timeZone: "UTC"
    }).formatToParts(new Date(Date.UTC(year, month - 1, 1)))
    const monthText = parts.find((part) => part.type === "month")?.value ?? ""
    const yearText = parts.find((part) => part.type === "year")?.value ?? ""

    return {
        label: `${monthText.padStart(2, "0")}/${yearText}`,
        dateTime: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`
    }
}

export default formatSinceDate
