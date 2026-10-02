import getLanguage from "@/i18n/getLanguage"
import API_URL from "@/services/http/apiUrl"
import parseResponse from "@/services/http/parseResponse"
import type HttpOptions from "@/types/http/HttpOptions.types"

async function post<T>(path: string, body: unknown, options?: HttpOptions): Promise<T> {
    const response = await fetch(API_URL + path, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Accept-Language": getLanguage(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal: options?.signal
    })
    return parseResponse<T>(response)
}

export default post
