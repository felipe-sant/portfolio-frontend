const TIMESTAMP_BYTES = 6
const BITS_PER_BYTE = 8

function toHex(bytes: Uint8Array): string {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

function generateUuidV7(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    const timestamp = BigInt(Date.now())

    for (let index = 0; index < TIMESTAMP_BYTES; index += 1) {
        const shift = BigInt((TIMESTAMP_BYTES - 1 - index) * BITS_PER_BYTE)
        bytes[index] = Number((timestamp >> shift) & 0xffn)
    }

    bytes[6] = (bytes[6] & 0x0f) | 0x70
    bytes[8] = (bytes[8] & 0x3f) | 0x80

    const hex = toHex(bytes)

    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20)
    ].join("-")
}

export default generateUuidV7
