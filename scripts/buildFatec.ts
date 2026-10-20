import { spawnSync } from "node:child_process"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import prepareFatecArtifact from "@scripts/prepareFatecArtifact"

const result = spawnSync("npm", ["run", "build"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, BASE_PATH: FATEC_BASE_PATH }
})

if (result.status !== 0) {
    process.exit(result.status ?? 1)
}

prepareFatecArtifact("dist")
