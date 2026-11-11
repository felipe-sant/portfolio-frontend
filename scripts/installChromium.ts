import { spawn } from "node:child_process"
import runWithRetry from "@scripts/runWithRetry"

const DELAYS_IN_SECONDS = [30, 90]
const ATTEMPT_TIMEOUT_IN_MS = 240000
const TIMEOUT_CODE = 124

function install() {
    return new Promise<number>((resolve) => {
        const child = spawn("npx", ["playwright", "install", "chromium"], {
            stdio: "inherit",
            detached: true
        })
        let timedOut = false

        const timer = setTimeout(() => {
            timedOut = true
            if (child.pid !== undefined) {
                try {
                    process.kill(-child.pid, "SIGKILL")
                } catch {
                    child.kill("SIGKILL")
                }
            }
        }, ATTEMPT_TIMEOUT_IN_MS)

        child.on("error", () => {
            clearTimeout(timer)
            resolve(1)
        })

        child.on("close", (status) => {
            clearTimeout(timer)
            resolve(timedOut ? TIMEOUT_CODE : (status ?? 1))
        })
    })
}

function wait(seconds: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, seconds * 1000))
}

const code = await runWithRetry(
    install,
    DELAYS_IN_SECONDS,
    wait,
    (message) => process.stdout.write(`${message}\n`),
    TIMEOUT_CODE
)

process.exit(code)
