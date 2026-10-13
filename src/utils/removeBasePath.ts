import publicUrl from "@/utils/publicUrl"

function removeBasePath(pathname: string): string {
    const base = publicUrl("/")

    if (base === "/") {
        return pathname
    }

    if (`${pathname}/` === base) {
        return "/"
    }

    if (!pathname.startsWith(base)) {
        return pathname
    }

    return `/${pathname.slice(base.length)}`
}

export default removeBasePath
