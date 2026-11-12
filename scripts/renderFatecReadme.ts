const TAG_PATTERN = /^v1\.[0-9]+\.[0-9]+$/
const SHA_PATTERN = /^[0-9a-f]{7,40}$/

type FatecReadmeOrigin = {
    tag: string
    sha: string
}

function renderFatecReadme(template: string, origin: FatecReadmeOrigin): string {
    if (!TAG_PATTERN.test(origin.tag)) {
        throw new Error(`A tag "${origin.tag}" não segue o padrão v1.x.y.`)
    }

    if (!SHA_PATTERN.test(origin.sha)) {
        throw new Error(`O SHA "${origin.sha}" não é hexadecimal de 7 a 40 caracteres.`)
    }

    const rendered = template.replaceAll("{{TAG}}", origin.tag).replaceAll("{{SHA}}", origin.sha)

    if (rendered.includes("{{")) {
        throw new Error("O modelo do README da Fatec tem marcador sem substituição.")
    }

    return rendered
}

export default renderFatecReadme
