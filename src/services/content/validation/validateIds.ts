import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import isUuidV7 from "@/services/content/isUuidV7"
import isRecord from "@/services/content/validation/isRecord"
import requireList from "@/services/content/validation/requireList"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

type CertificateData = { name: unknown; issuer: unknown }

function checkId(id: unknown, path: string, issues: ContentIssue[], seen?: Set<string>): void {
    if (!isUuidV7(id)) {
        issues.push({
            path,
            message: `O id deve ser um UUID v7 canônico em minúsculas: ${JSON.stringify(id)}`
        })
        return
    }
    if (seen?.has(id)) {
        issues.push({ path, message: `Id repetido: ${id}` })
    }
    seen?.add(id)
}

function validateIds(snapshot: ContentSnapshot): ContentIssue[] {
    const issues: ContentIssue[] = []

    for (const lang of SUPPORTED_LANGUAGES) {
        const projectIds = new Set<string>()
        const documentIds = new Set<string>()
        const timelineIds = new Set<string>()
        const certificates = new Map<string, CertificateData>()
        const projectsPath = `content/${lang}/projects.json#items`
        const timelinePath = `content/${lang}/timeline.json#items`

        snapshot.languages[lang].projects?.forEach((record, index) => {
            const path = `${projectsPath}[${index}]`
            checkId(record.id, `${path}.id`, issues, projectIds)
            requireList(record.documents, `${path}.documents`, issues).forEach(
                (document, position) => {
                    if (isRecord(document)) {
                        checkId(
                            document.id,
                            `${path}.documents[${position}].id`,
                            issues,
                            documentIds
                        )
                    }
                }
            )
        })

        snapshot.languages[lang].timeline?.forEach((item, index) => {
            const path = `${timelinePath}[${index}]`
            checkId(item.id, `${path}.id`, issues, timelineIds)
            requireList(item.certificates, `${path}.certificates`, issues).forEach(
                (certificate, position) => {
                    if (!isRecord(certificate)) {
                        return
                    }
                    const certificatePath = `${path}.certificates[${position}]`
                    checkId(certificate.id, `${certificatePath}.id`, issues)
                    if (typeof certificate.id !== "string") {
                        return
                    }
                    const first = certificates.get(certificate.id)
                    if (
                        first &&
                        (first.name !== certificate.name || first.issuer !== certificate.issuer)
                    ) {
                        issues.push({
                            path: certificatePath,
                            message: `O certificado ${certificate.id} aparece com name ou issuer diferentes`
                        })
                    }
                    if (!first) {
                        certificates.set(certificate.id, {
                            name: certificate.name,
                            issuer: certificate.issuer
                        })
                    }
                }
            )
        })
    }

    return issues
}

export default validateIds
