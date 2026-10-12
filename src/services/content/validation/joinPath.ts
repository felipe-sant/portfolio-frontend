function joinPath(path: string, key: string): string {
    return path.endsWith("#") ? `${path}${key}` : `${path}.${key}`
}

export default joinPath
