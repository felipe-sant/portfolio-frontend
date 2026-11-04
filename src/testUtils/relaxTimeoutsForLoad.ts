import { vi } from "vitest"
import { configure } from "@testing-library/react"

const LOADED_TEST_TIMEOUT = 15000
const LOADED_ASYNC_UTIL_TIMEOUT = 5000

function relaxTimeoutsForLoad(): void {
    vi.setConfig({ testTimeout: LOADED_TEST_TIMEOUT })
    configure({ asyncUtilTimeout: LOADED_ASYNC_UTIL_TIMEOUT })
}

export default relaxTimeoutsForLoad
