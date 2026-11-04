import { vi } from "vitest"
import clearContentCache from "@/services/content/clearContentCache"
import type stubContentFetch from "@/testUtils/stubContentFetch"

function ignore() {}

function holdFetchAfter(fetchMock: ReturnType<typeof stubContentFetch>, allowed: number) {
    let release = ignore
    const gate = new Promise<void>((resolve) => {
        release = resolve
    })
    let calls = 0

    clearContentCache()
    vi.stubGlobal(
        "fetch",
        vi.fn(async (input: string | URL | Request) => {
            calls += 1

            if (calls > allowed) {
                await gate
            }

            return fetchMock(input)
        })
    )

    return release
}

export default holdFetchAfter
