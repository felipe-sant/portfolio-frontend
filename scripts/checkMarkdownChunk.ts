import { join } from "node:path"
import checkMarkdownChunk from "@scripts/markdownChunk/checkMarkdownChunk"

const result = await checkMarkdownChunk(process.argv[2] ?? join("dist", "assets"))

for (const message of result.messages) {
    console.log(message)
}

if (!result.ok) {
    process.exitCode = 1
}
