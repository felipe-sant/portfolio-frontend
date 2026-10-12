const MAX_DIMENSION = 16384
const COLOR_PATTERN = /^#[0-9a-f]{6}$/i
const OPAQUE_ALPHA = 255

class BitWriter {
    private readonly bytes: number[] = []
    private bitCount = 0

    write(value: number, count: number): void {
        for (let bit = 0; bit < count; bit += 1) {
            if (this.bitCount % 8 === 0) {
                this.bytes.push(0)
            }
            this.bytes[this.bytes.length - 1] |= ((value >> bit) & 1) << (this.bitCount % 8)
            this.bitCount += 1
        }
    }

    toBytes(): number[] {
        return this.bytes
    }
}

function parseColor(color: string): [number, number, number] {
    if (!COLOR_PATTERN.test(color)) {
        throw new Error(`Cor inválida: ${color}. Use o formato #rrggbb.`)
    }

    return [
        parseInt(color.slice(1, 3), 16),
        parseInt(color.slice(3, 5), 16),
        parseInt(color.slice(5, 7), 16)
    ]
}

function writeAscii(target: number[], text: string): void {
    for (const character of text) {
        target.push(character.charCodeAt(0))
    }
}

function writeUint32(target: number[], value: number): void {
    target.push(value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >>> 24) & 0xff)
}

function isValidSize(size: number): boolean {
    return Number.isInteger(size) && size >= 1 && size <= MAX_DIMENSION
}

function createSolidWebp(width: number, height: number, color: string): Uint8Array {
    if (!isValidSize(width) || !isValidSize(height)) {
        throw new Error(
            `Dimensões inválidas: ${width}x${height}. Use inteiros de 1 a ${MAX_DIMENSION}.`
        )
    }

    const [red, green, blue] = parseColor(color)
    const writer = new BitWriter()

    writer.write(width - 1, 14)
    writer.write(height - 1, 14)
    writer.write(0, 1)
    writer.write(0, 3)
    writer.write(0, 1)
    writer.write(0, 1)
    writer.write(0, 1)

    for (const symbol of [green, red, blue, OPAQUE_ALPHA]) {
        writer.write(1, 1)
        writer.write(0, 1)
        writer.write(1, 1)
        writer.write(symbol, 8)
    }

    writer.write(1, 1)
    writer.write(0, 1)
    writer.write(0, 1)
    writer.write(0, 1)

    const payload = [0x2f, ...writer.toBytes()]
    const padding = payload.length % 2
    const chunkSize = payload.length
    const riffSize = 4 + 8 + chunkSize + padding
    const output: number[] = []

    writeAscii(output, "RIFF")
    writeUint32(output, riffSize)
    writeAscii(output, "WEBP")
    writeAscii(output, "VP8L")
    writeUint32(output, chunkSize)
    output.push(...payload)
    if (padding) {
        output.push(0)
    }

    return Uint8Array.from(output)
}

export default createSolidWebp
