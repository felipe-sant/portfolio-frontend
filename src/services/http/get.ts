import getLanguage from "@/i18n/getLanguage"
import API_URL from "@/services/http/apiUrl"
import parseResponse from "@/services/http/parseResponse"
import type HttpOptions from "@/types/http/HttpOptions.types"

async function get<T>(path: string, options?: HttpOptions): Promise<T> {
    const response = await fetch(API_URL + path, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Accept-Language": getLanguage()
        },
        signal: options?.signal
    })
    return parseResponse<T>(response)
}

export default get
