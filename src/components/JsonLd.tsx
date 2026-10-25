import type JsonLdNode from "@/types/seo/JsonLdNode.types"
import serializeJsonLd from "@/utils/serializeJsonLd"

interface JsonLdProps {
    data: JsonLdNode
}

function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
    )
}

export default JsonLd
