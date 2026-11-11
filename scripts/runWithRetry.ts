async function runWithRetry(
    execute: () => number | Promise<number>,
    delaysInSeconds: number[],
    wait: (seconds: number) => Promise<void>,
    log: (message: string) => void,
    timeoutCode?: number
): Promise<number> {
    const attempts = delaysInSeconds.length + 1
    let code = 0

    for (let attempt = 1; attempt <= attempts; attempt++) {
        log(`Tentativa ${attempt} de ${attempts}.`)
        code = await execute()

        if (code === 0) {
            return 0
        }

        if (code === timeoutCode) {
            log(`A tentativa ${attempt} excedeu o tempo limite e foi interrompida.`)
        }

        const delay = delaysInSeconds[attempt - 1]

        if (delay === undefined) {
            log(`A tentativa ${attempt} falhou com o código ${code}. Sem novas tentativas.`)
            return code
        }

        log(`A tentativa ${attempt} falhou com o código ${code}. Nova tentativa em ${delay} segundos.`)
        await wait(delay)
    }

    return code
}

export default runWithRetry
