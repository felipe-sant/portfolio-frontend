import { vi } from "vitest"
import publicUrl from "@/utils/publicUrl"

function stripBase(url: string): string {
    const base = publicUrl("")

    return url.startsWith(base) ? url.slice(base.length) : url.replace(/^\/+/, "")
}

function stubContentFetch(files: Record<string, unknown>) {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
        const url = input instanceof Request ? input.url : String(input)
        const path = stripBase(url)

        if (!(path in files)) {
            return new Response("", { status: 404 })
        }

        const body = files[path]

        return typeof body === "string"
            ? new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
            : new Response(JSON.stringify(body), {
                  headers: { "Content-Type": "application/json; charset=utf-8" }
              })
    })

    vi.stubGlobal("fetch", fetchMock)

    return fetchMock
}

export default stubContentFetch
