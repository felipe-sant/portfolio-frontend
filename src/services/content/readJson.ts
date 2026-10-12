import readText from "@/services/content/readText"

async function readJson<T>(path: string): Promise<T> {
    const text = await readText(path)

    return JSON.parse(text) as T
}

export default readJson
