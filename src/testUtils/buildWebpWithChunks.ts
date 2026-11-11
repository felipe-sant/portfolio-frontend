function writeAscii(target: number[], text: string): void {
    for (const character of text) {
        target.push(character.charCodeAt(0))
    }
}

function writeUint32(target: number[], value: number): void {
    target.push(value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >>> 24) & 0xff)
}

function buildWebpWithChunks(names: string[], payloadSize = 4): Uint8Array {
    const body: number[] = []

    for (const name of names) {
        writeAscii(body, name)
        writeUint32(body, payloadSize)
        body.push(...Array.from({ length: payloadSize }, () => 0))
        if (payloadSize % 2) {
            body.push(0)
        }
    }

    const output: number[] = []
    writeAscii(output, "RIFF")
    writeUint32(output, 4 + body.length)
    writeAscii(output, "WEBP")
    output.push(...body)

    return Uint8Array.from(output)
}

export default buildWebpWithChunks
