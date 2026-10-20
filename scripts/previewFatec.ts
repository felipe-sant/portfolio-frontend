import { spawnSync } from "node:child_process"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"

const result = spawnSync("npx", ["vite", "preview"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, BASE_PATH: FATEC_BASE_PATH }
})

process.exit(result.status ?? 1)
