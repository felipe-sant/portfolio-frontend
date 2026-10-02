async function readBody(response: Response): Promise<string> {
    try {
        return (await response.text()).trim()
    } catch {
        return ""
    }
}

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const body = await readBody(response)
        const reason = body ? `: ${body}` : "."
        throw new Error(`Requisição falhou com status ${response.status}${reason}`)
    }
    return (await response.json()) as T
}

export default parseResponse
