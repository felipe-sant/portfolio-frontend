import { brotliDecompressSync } from "node:zlib"

const KNOWN_TAGS = [
    "cmap",
    "head",
    "hhea",
    "hmtx",
    "maxp",
    "name",
    "OS/2",
    "post",
    "cvt ",
    "fpgm",
    "glyf",
    "loca",
    "prep"
]
const HEADER_SIZE = 48
const CUSTOM_TAG_FLAG = 63

type TableEntry = { tag: string; length: number }

function readBase128(buffer: Buffer, start: number): { value: number; next: number } {
    let value = 0
    let offset = start
    for (let index = 0; index < 5; index += 1) {
        const byte = buffer[offset]
        offset += 1
        value = value * 128 + (byte & 0x7f)
        if ((byte & 0x80) === 0) {
            return { value, next: offset }
        }
    }
    throw new Error("Tamanho inválido na tabela da fonte woff2")
}

function readDirectory(buffer: Buffer): { entries: TableEntry[]; next: number } {
    const tableCount = buffer.readUInt16BE(12)
    const entries: TableEntry[] = []
    let offset = HEADER_SIZE
    for (let index = 0; index < tableCount; index += 1) {
        const flags = buffer[offset]
        offset += 1
        const tagIndex = flags & 0x3f
        const version = flags >> 6
        let tag = KNOWN_TAGS[tagIndex] ?? ""
        if (tagIndex === CUSTOM_TAG_FLAG) {
            tag = buffer.toString("latin1", offset, offset + 4)
            offset += 4
        }
        const original = readBase128(buffer, offset)
        offset = original.next
        const isGlyfOrLoca = tag === "glyf" || tag === "loca"
        const isTransformed = isGlyfOrLoca ? version === 0 : tag === "hmtx" && version === 1
        let length = original.value
        if (isTransformed) {
            const transformed = readBase128(buffer, offset)
            offset = transformed.next
            length = transformed.value
        }
        entries.push({ tag, length })
    }
    return { entries, next: offset }
}

function readFormat4(table: Buffer, start: number, codepoints: Set<number>) {
    const segmentCount = table.readUInt16BE(start + 6) / 2
    const endBase = start + 14
    const startBase = endBase + segmentCount * 2 + 2
    for (let segment = 0; segment < segmentCount; segment += 1) {
        const end = table.readUInt16BE(endBase + segment * 2)
        const first = table.readUInt16BE(startBase + segment * 2)
        for (let code = first; code <= end && code !== 0xffff; code += 1) {
            codepoints.add(code)
        }
    }
}

function readFormat12(table: Buffer, start: number, codepoints: Set<number>) {
    const groupCount = table.readUInt32BE(start + 12)
    for (let group = 0; group < groupCount; group += 1) {
        const base = start + 16 + group * 12
        const first = table.readUInt32BE(base)
        const end = table.readUInt32BE(base + 4)
        for (let code = first; code <= end; code += 1) {
            codepoints.add(code)
        }
    }
}

function readWoff2Codepoints(file: Buffer): Set<number> {
    const { entries, next } = readDirectory(file)
    const data = brotliDecompressSync(file.subarray(next, next + file.readUInt32BE(20)))
    let offset = 0
    let cmapStart = -1
    for (const entry of entries) {
        if (entry.tag === "cmap") {
            cmapStart = offset
        }
        offset += entry.length
    }
    if (cmapStart < 0) {
        throw new Error("Fonte woff2 sem tabela cmap")
    }
    const cmap = data.subarray(cmapStart)
    const codepoints = new Set<number>()
    const recordCount = cmap.readUInt16BE(2)
    for (let record = 0; record < recordCount; record += 1) {
        const subtableStart = cmap.readUInt32BE(4 + record * 8 + 4)
        const format = cmap.readUInt16BE(subtableStart)
        if (format === 4) {
            readFormat4(cmap, subtableStart, codepoints)
        }
        if (format === 12) {
            readFormat12(cmap, subtableStart, codepoints)
        }
    }
    return codepoints
}

export default readWoff2Codepoints
