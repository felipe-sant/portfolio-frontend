import type Certificate from "@/types/timeline/Certificate.types"
import type TimelineGroup from "@/types/timeline/TimelineGroup.types"

function collectCertificates(groups: TimelineGroup[]): Certificate[] {
    const certificates = groups.flatMap((group) => group.items.flatMap((item) => item.certificates))

    return certificates.filter(
        (certificate, index) =>
            certificates.findIndex((candidate) => candidate.id === certificate.id) === index
    )
}

export default collectCertificates
