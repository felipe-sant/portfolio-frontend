import validateDates from "@/services/content/validation/validateDates"
import validateDocuments from "@/services/content/validation/validateDocuments"
import validateEmptyValues from "@/services/content/validation/validateEmptyValues"
import validateEnums from "@/services/content/validation/validateEnums"
import validateIds from "@/services/content/validation/validateIds"
import validateImages from "@/services/content/validation/validateImages"
import validateLanguageParity from "@/services/content/validation/validateLanguageParity"
import validateProfile from "@/services/content/validation/validateProfile"
import validateProjects from "@/services/content/validation/validateProjects"
import validateReferences from "@/services/content/validation/validateReferences"
import validateTimeline from "@/services/content/validation/validateTimeline"
import validateTranslation from "@/services/content/validation/validateTranslation"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

function validateContent(snapshot: ContentSnapshot): ContentIssue[] {
    return [
        ...snapshot.issues,
        ...validateLanguageParity(snapshot),
        ...validateTranslation(snapshot),
        ...validateEmptyValues(snapshot),
        ...validateIds(snapshot),
        ...validateReferences(snapshot),
        ...validateDates(snapshot),
        ...validateEnums(snapshot),
        ...validateProjects(snapshot),
        ...validateImages(snapshot),
        ...validateDocuments(snapshot),
        ...validateTimeline(snapshot),
        ...validateProfile(snapshot)
    ]
}

export default validateContent
