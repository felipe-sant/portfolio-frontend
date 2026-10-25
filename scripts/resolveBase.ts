const INVALID_BASE = /\/\/|\.\.|[\s?#]/

function resolveBase(value: string | undefined): string {
    const trimmed = value ?? ""

    if (INVALID_BASE.test(trimmed)) {
        throw new Error(
            `BASE_PATH inválido: "${trimmed}". Não use "//", "..", espaço, "?" nem "#".`
        )
    }

    const segment = trimmed.replace(/^\/+|\/+$/g, "")

    return segment === "" ? "/" : `/${segment}/`
}

export default resolveBase
