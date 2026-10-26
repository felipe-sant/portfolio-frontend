import contentCache from "@/services/content/contentCache"
import publicUrl from "@/utils/publicUrl"

async function fetchText(path: string): Promise<string> {
    const response = await fetch(publicUrl(path))

    if (!response.ok) {
        throw new Error(`Falha ao carregar o arquivo ${path}: status ${response.status}`)
    }

    return response.text()
}

function readText(path: string): Promise<string> {
    const cached = contentCache.get(path)

    if (cached) {
        return cached
    }

    const request = fetchText(path)
    contentCache.set(path, request)
    request.catch(() => {
        if (contentCache.get(path) === request) {
            contentCache.delete(path)
        }
    })

    return request
}

export default readText
