import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type FormattedPeriod from "@/types/timeline/FormattedPeriod.types"
import formatSinceDate from "@/utils/formatSinceDate"

function formatPeriod(
    start: string,
    end: string | undefined,
    language: SupportedLanguage
): FormattedPeriod {
    return {
        start: formatSinceDate(start, language),
        end: end === undefined ? undefined : formatSinceDate(end, language),
        isCurrent: end === undefined
    }
}

export default formatPeriod
