import { join } from "node:path"
import generateResumePdfs from "@scripts/cv/generateResumePdfs"

const DIRECTORY = join(process.cwd(), "public", "cv")

await generateResumePdfs(DIRECTORY, DIRECTORY)

console.log(`Gerado em: ${DIRECTORY}`)
