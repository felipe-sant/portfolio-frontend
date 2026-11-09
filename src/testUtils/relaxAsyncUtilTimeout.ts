import { configure } from "@testing-library/react"

const LOADED_ASYNC_UTIL_TIMEOUT = 5000

function relaxAsyncUtilTimeout(): void {
    configure({ asyncUtilTimeout: LOADED_ASYNC_UTIL_TIMEOUT })
}

export default relaxAsyncUtilTimeout
