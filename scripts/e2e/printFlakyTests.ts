import { readFileSync } from "node:fs"
import formatFlakyWarning from "@scripts/e2e/formatFlakyWarning"
import listFlakyTests from "@scripts/e2e/listFlakyTests"

const DEFAULT_REPORT = "merged-report.json"

const report = JSON.parse(readFileSync(process.argv[2] ?? DEFAULT_REPORT, "utf-8"))

process.stdout.write(formatFlakyWarning(listFlakyTests(report)))
