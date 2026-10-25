import type JsonLdNode from "@/types/seo/JsonLdNode.types"

function serializeJsonLd(value: JsonLdNode): string {
    return JSON.stringify(value).replace(/</g, "\\u003c")
}

export default serializeJsonLd
