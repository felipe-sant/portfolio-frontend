const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/

function resolveRelease(version: string, existingTags: string[]) {
    const match = SEMVER.exec(version)

    if (!match) {
        throw new Error(`Versão inválida: "${version}". Use somente MAJOR.MINOR.PATCH.`)
    }

    const major = Number(match[1])
    const tag = `v${version}`
    const release = major >= 1 && !existingTags.includes(tag)

    return { release, tag, publishFatec: release && major === 1 }
}

export default resolveRelease
