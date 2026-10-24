function shouldHydrate(prerenderedPath: string | undefined, pathname: string): boolean {
    return prerenderedPath !== undefined && prerenderedPath === pathname
}

export default shouldHydrate
