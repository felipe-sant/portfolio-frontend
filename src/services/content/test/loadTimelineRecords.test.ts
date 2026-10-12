import { afterEach, describe, expect, it, vi } from "vitest"
import loadTimelineRecords from "@/services/content/loadTimelineRecords"
import buildTimelineItemRecord from "@/testUtils/buildTimelineItemRecord"
import stubContentFetch from "@/testUtils/stubContentFetch"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("loadTimelineRecords", () => {
    it("lê os itens de trajetória do idioma pedido", async () => {
        const records = [buildTimelineItemRecord()]
        const fetchMock = stubContentFetch({ "content/es/timeline.json": { items: records } })

        await expect(loadTimelineRecords("es")).resolves.toEqual(records)
        expect(fetchMock).toHaveBeenCalledWith("/content/es/timeline.json")
    })
})
