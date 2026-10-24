import { readFile } from "node:fs/promises"
import { join } from "node:path"

function installPublicFetch(base: string, publicDirectory = "public"): () => void {
    const originalFetch = globalThis.fetch

    const publicFetch: typeof fetch = async (input, init) => {
        const url = input instanceof Request ? input.url : String(input)

        if (!url.startsWith(base)) {
            return originalFetch(input, init)
        }

        try {
            const file = join(publicDirectory, decodeURIComponent(url.slice(base.length)))
            return new Response(new Uint8Array(await readFile(file)), { status: 200 })
        } catch {
            return new Response("", { status: 404 })
        }
    }

    globalThis.fetch = publicFetch

    return () => {
        globalThis.fetch = originalFetch
    }
}

export default installPublicFetch
