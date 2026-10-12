import publicUrl from "@/services/content/publicUrl"

async function readText(path: string): Promise<string> {
    const response = await fetch(publicUrl(path))

    if (!response.ok) {
        throw new Error(`Falha ao carregar o arquivo ${path}: status ${response.status}`)
    }

    return response.text()
}

export default readText
