function appendWebpChunk(bytes: Uint8Array, name: string, payloadSize = 4): Uint8Array {
    const chunk: number[] = [...name].map((character) => character.charCodeAt(0))
    chunk.push(payloadSize & 0xff, (payloadSize >> 8) & 0xff, 0, 0)
    chunk.push(...Array.from({ length: payloadSize }, () => 0))
    if (payloadSize % 2) {
        chunk.push(0)
    }

    const output = new Uint8Array(bytes.length + chunk.length)
    output.set(bytes)
    output.set(chunk, bytes.length)
    new DataView(output.buffer).setUint32(4, output.length - 8, true)

    return output
}

export default appendWebpChunk
