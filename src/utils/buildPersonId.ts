import getSiteUrl from "@/utils/getSiteUrl"
import publicUrl from "@/utils/publicUrl"

function buildPersonId(): string {
    return `${getSiteUrl()}${publicUrl("/")}#person`
}

export default buildPersonId
