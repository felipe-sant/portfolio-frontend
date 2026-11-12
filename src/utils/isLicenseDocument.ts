const LICENSE_PATTERN = /^license(\.[^.]+)?$/i

function isLicenseDocument(name: string): boolean {
    return LICENSE_PATTERN.test(name)
}

export default isLicenseDocument
