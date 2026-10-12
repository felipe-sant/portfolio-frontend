import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

function compareDescending(first: string, second: string): number {
    if (first === second) {
        return 0
    }
    return first > second ? -1 : 1
}

function compareRecords(first: TimelineItemRecord, second: TimelineItemRecord): number {
    if (first.end === undefined && second.end !== undefined) {
        return -1
    }
    if (first.end !== undefined && second.end === undefined) {
        return 1
    }
    if (first.end !== undefined && second.end !== undefined) {
        const byEnd = compareDescending(first.end, second.end)
        if (byEnd !== 0) {
            return byEnd
        }
    }
    return compareDescending(first.start, second.start)
}

function sortTimelineRecords(records: TimelineItemRecord[]): TimelineItemRecord[] {
    return records.toSorted(compareRecords)
}

export default sortTimelineRecords
