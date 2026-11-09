const MERGE_SUBJECT = /^Merge pull request #(\d+) /
const SQUASH_SUBJECT = /\(#(\d+)\)$/

function parseMergedPullNumbers(subjects: string[]) {
    const numbers = subjects.flatMap((subject) => {
        const match = MERGE_SUBJECT.exec(subject) ?? SQUASH_SUBJECT.exec(subject.trim())
        return match ? [Number(match[1])] : []
    })

    return [...new Set(numbers)].toSorted((a, b) => a - b)
}

export default parseMergedPullNumbers
