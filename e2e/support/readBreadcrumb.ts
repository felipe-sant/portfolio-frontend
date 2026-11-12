import type { Page } from "@playwright/test"
import isRecord from "./isRecord"

type BreadcrumbEntry = { position: number; name: string; item: string }

function readEntry(value: unknown): BreadcrumbEntry[] {
    if (!isRecord(value)) {
        return []
    }

    const { position, name, item } = value

    if (typeof position !== "number" || typeof name !== "string" || typeof item !== "string") {
        return []
    }

    return [{ position, name, item }]
}

function parseBreadcrumb(raw: string): BreadcrumbEntry[] {
    const node: unknown = JSON.parse(raw)

    if (!isRecord(node) || node["@type"] !== "BreadcrumbList") {
        return []
    }

    const list = node.itemListElement

    return Array.isArray(list) ? list.flatMap(readEntry) : []
}

async function readBreadcrumb(page: Page): Promise<BreadcrumbEntry[]> {
    const raws = await page.locator('script[type="application/ld+json"]').allTextContents()

    return raws.flatMap(parseBreadcrumb)
}

export default readBreadcrumb
