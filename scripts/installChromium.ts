import { spawnSync } from "node:child_process"
import runWithRetry from "@scripts/runWithRetry"

const DELAYS_IN_SECONDS = [30, 90]

function install() {
    const result = spawnSync("npx", ["playwright", "install", "--with-deps", "chromium"], { stdio: "inherit" })
    return result.status ?? 1
}

function wait(seconds: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, seconds * 1000))
}

const code = await runWithRetry(install, DELAYS_IN_SECONDS, wait, (message) => process.stdout.write(`${message}\n`))

process.exit(code)
