import type SinceDate from "@/types/home/SinceDate.types"

type FormattedPeriod = {
    start: SinceDate
    end?: SinceDate
    isCurrent: boolean
}

export default FormattedPeriod
