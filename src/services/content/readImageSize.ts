type ImageSize = {
    width: number
    height: number
}

function readAscii(bytes: Uint8Array, start: number, length: number): string {
    return String.fromCharCode(...bytes.slice(start, start + length))
}

function readUint16(bytes: Uint8Array, offset: number): number {
    return bytes[offset] | (bytes[offset + 1] << 8)
}

function readUint24(bytes: Uint8Array, offset: number): number {
    return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16)
}

function readLossy(bytes: Uint8Array): ImageSize {
    const hasStartCode = bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a

    if (!hasStartCode) {
        throw new Error("Imagem WebP inválida: quadro VP8 sem código de início.")
    }

    return { width: readUint16(bytes, 26) & 0x3fff, height: readUint16(bytes, 28) & 0x3fff }
}

function readLossless(bytes: Uint8Array): ImageSize {
    if (bytes[20] !== 0x2f) {
        throw new Error("Imagem WebP inválida: assinatura VP8L ausente.")
    }

    const bits = bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] * 2 ** 24)

    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 }
}

function readExtended(bytes: Uint8Array): ImageSize {
    return { width: readUint24(bytes, 24) + 1, height: readUint24(bytes, 27) + 1 }
}

function readImageSize(bytes: Uint8Array): ImageSize {
    const isWebp =
        bytes.length >= 30 && readAscii(bytes, 0, 4) === "RIFF" && readAscii(bytes, 8, 4) === "WEBP"

    if (!isWebp) {
        throw new Error("Formato de imagem não reconhecido: esperado WebP.")
    }

    const format = readAscii(bytes, 12, 4)

    if (format === "VP8 ") {
        return readLossy(bytes)
    }
    if (format === "VP8L") {
        return readLossless(bytes)
    }
    if (format === "VP8X") {
        return readExtended(bytes)
    }

    throw new Error(`Formato WebP não suportado: ${format}.`)
}

export default readImageSize
