import { vi } from "vitest"
import type stubContentFetch from "@/testUtils/stubContentFetch"

function failFetchAfter(fetchMock: ReturnType<typeof stubContentFetch>, allowed: number) {
    let calls = 0
    let shouldFail = true

    vi.stubGlobal(
        "fetch",
        vi.fn(async (input: string | URL | Request) => {
            calls += 1

            if (calls > allowed && shouldFail) {
                return new Response("", { status: 500 })
            }

            return fetchMock(input)
        })
    )

    return () => {
        shouldFail = false
    }
}

export default failFetchAfter
