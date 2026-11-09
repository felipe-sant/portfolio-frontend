import { appendFileSync, readFileSync, writeFileSync } from "node:fs"
import replaceVersionPrBoilerplate from "@scripts/replaceVersionPrBoilerplate"

const bodyFile = process.argv[2]

if (bodyFile === undefined) {
    throw new Error("Informe o arquivo com o corpo do PR de versão.")
}

const current = readFileSync(bodyFile, "utf-8")
const next = replaceVersionPrBoilerplate(current)
const line = `changed=${next === current ? "false" : "true"}\n`

writeFileSync(bodyFile, next)

if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, line)
} else {
    process.stdout.write(line)
}
