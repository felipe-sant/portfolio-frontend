const BYTES_PER_KILOBYTE = 1024

function isWithinKilobytes(bytes: number, kilobytes: number): boolean {
    return bytes <= kilobytes * BYTES_PER_KILOBYTE
}

export default isWithinKilobytes
