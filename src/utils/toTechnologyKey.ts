function toTechnologyKey(text: string): string {
    return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
}

export default toTechnologyKey
