import { spawnSync } from "node:child_process"
import { existsSync, renameSync, rmSync } from "node:fs"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import FATEC_SITE_URL from "@scripts/fatecSiteUrl"
import prepareFatecArtifact from "@scripts/prepareFatecArtifact"

const OUTPUT = "dist"
const FORM_OUTPUT = "dist-form"
const SAVED_OUTPUT = "dist-saved"

const hadOutput = existsSync(OUTPUT)

rmSync(SAVED_OUTPUT, { recursive: true, force: true })
if (hadOutput) {
    renameSync(OUTPUT, SAVED_OUTPUT)
}

let succeeded = false

try {
    const result = spawnSync("npm", ["run", "build"], {
        stdio: "inherit",
        shell: true,
        env: {
            ...process.env,
            BASE_PATH: FATEC_BASE_PATH,
            VITE_SITE_URL: FATEC_SITE_URL,
            VITE_CONTACT_FORM_ENABLED: "true"
        }
    })

    if (result.status !== 0) {
        process.exitCode = result.status ?? 1
    } else {
        prepareFatecArtifact(OUTPUT)
        rmSync(FORM_OUTPUT, { recursive: true, force: true })
        renameSync(OUTPUT, FORM_OUTPUT)
        succeeded = true
    }
} finally {
    if (!succeeded) {
        rmSync(OUTPUT, { recursive: true, force: true })
    }
    if (hadOutput) {
        renameSync(SAVED_OUTPUT, OUTPUT)
    }
}
