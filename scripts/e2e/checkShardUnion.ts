type ShardUnionResult = {
    missing: string[]
    duplicated: string[]
    extra: string[]
}

function checkShardUnion(all: string[], shards: string[][]): ShardUnionResult {
    const counts = new Map<string, number>()
    for (const id of shards.flat()) {
        counts.set(id, (counts.get(id) ?? 0) + 1)
    }
    const total = new Set(all)

    return {
        missing: all.filter((id) => !counts.has(id)),
        duplicated: [...counts].filter(([, count]) => count > 1).map(([id]) => id),
        extra: [...counts.keys()].filter((id) => !total.has(id))
    }
}

export default checkShardUnion
