const WEBP_PREFIX = "data:image/webp;base64,"

function decodeWebpDataUrl(dataUrl: string): Buffer {
    if (!dataUrl.startsWith(WEBP_PREFIX)) {
        throw new Error(
            "O navegador não devolveu um data:image/webp; a conversão para WebP não é suportada."
        )
    }

    return Buffer.from(dataUrl.slice(WEBP_PREFIX.length), "base64")
}

export default decodeWebpDataUrl
