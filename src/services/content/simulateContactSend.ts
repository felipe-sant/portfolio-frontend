const SIMULATED_DELAY_MS = 1400

function simulateContactSend(): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, SIMULATED_DELAY_MS)
    })
}

export default simulateContactSend
