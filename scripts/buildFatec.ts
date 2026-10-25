import { spawnSync } from "node:child_process"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import FATEC_SITE_URL from "@scripts/fatecSiteUrl"
import prepareFatecArtifact from "@scripts/prepareFatecArtifact"

const result = spawnSync("npm", ["run", "build"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, BASE_PATH: FATEC_BASE_PATH, VITE_SITE_URL: FATEC_SITE_URL }
})

if (result.status !== 0) {
    process.exit(result.status ?? 1)
}

prepareFatecArtifact("dist")
