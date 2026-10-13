import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"
import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

type Entry<T> = { lang: SupportedLanguage; index: number; path: string; record: T }

function listEntries(snapshot: ContentSnapshot, file: "projects"): Entry<ProjectRecord>[]
function listEntries(snapshot: ContentSnapshot, file: "timeline"): Entry<TimelineItemRecord>[]
function listEntries(snapshot: ContentSnapshot, file: "projects" | "timeline") {
    return SUPPORTED_LANGUAGES.flatMap((lang) => {
        const records = snapshot.languages[lang][file] ?? []

        return records.map((record, index) => ({
            lang,
            index,
            path: `content/${lang}/${file}.json#items[${index}]`,
            record
        }))
    })
}

export default listEntries
