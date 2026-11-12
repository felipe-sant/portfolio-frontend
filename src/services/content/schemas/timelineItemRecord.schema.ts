import { array, enum as enumeration, object, optional, regex, string } from "zod/mini"
import TIMELINE_KINDS from "@/enum/timelineKinds.enum"
import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"
import type { ZodMiniType } from "zod/mini"

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

const timelineItemRecordSchema: ZodMiniType<TimelineItemRecord> = object({
    id: string(),
    kind: enumeration(TIMELINE_KINDS),
    title: string(),
    organization: optional(string()),
    stage: optional(string()),
    details: array(string()),
    start: string().check(regex(MONTH_PATTERN)),
    end: optional(string().check(regex(MONTH_PATTERN))),
    summary: string(),
    responsibilities: array(string()),
    disciplines: array(string()),
    technologies: array(string()),
    certificates: array(
        object({
            id: string(),
            name: string(),
            issuer: optional(string())
        })
    ),
    projectIds: array(string())
})

export default timelineItemRecordSchema
