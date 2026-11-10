function readAscii(bytes: Uint8Array, start: number, length: number): string {
    return String.fromCharCode(...bytes.slice(start, start + length))
}

function readUint32(bytes: Uint8Array, offset: number): number {
    return (
        (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16)) +
        bytes[offset + 3] * 2 ** 24
    )
}

function readWebpChunks(bytes: Uint8Array): string[] {
    const isWebp =
        bytes.length >= 12 && readAscii(bytes, 0, 4) === "RIFF" && readAscii(bytes, 8, 4) === "WEBP"

    if (!isWebp) {
        throw new Error("Formato de imagem não reconhecido: esperado WebP.")
    }

    const chunks: string[] = []
    let offset = 12

    while (offset < bytes.length) {
        if (offset + 8 > bytes.length) {
            throw new Error("Imagem WebP inválida: cabeçalho de bloco truncado.")
        }
        const size = readUint32(bytes, offset + 4)
        const end = offset + 8 + size + (size % 2)
        if (end > bytes.length + (size % 2)) {
            throw new Error("Imagem WebP inválida: tamanho de bloco além do fim do arquivo.")
        }
        chunks.push(readAscii(bytes, offset, 4))
        offset = end
    }

    return chunks
}

export default readWebpChunks
