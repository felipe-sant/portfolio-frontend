import { join } from "node:path"
import checkPdfChunk from "@scripts/pdfChunk/checkPdfChunk"

const result = await checkPdfChunk(process.argv[2] ?? join("dist", "assets"))

for (const message of result.messages) {
    console.log(message)
}

if (!result.ok) {
    process.exitCode = 1
}
