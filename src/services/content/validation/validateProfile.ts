import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import checkObjectKeys from "@/services/content/validation/checkObjectKeys"
import isHttpsUrl from "@/services/content/validation/isHttpsUrl"
import isRecord from "@/services/content/validation/isRecord"
import requireBoolean from "@/services/content/validation/requireBoolean"
import requireText from "@/services/content/validation/requireText"
import validateStack from "@/services/content/validation/validateStack"
import validateStringList from "@/services/content/validation/validateStringList"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

const REQUIRED_KEYS = [
    "role",
    "homeIntro",
    "summary",
    "location",
    "availability",
    "aboutParagraphs",
    "workPrinciples",
    "stack",
    "contact",
    "links"
]
const MAX_HOME_INTRO_LENGTH = 300
const MAX_EMAIL_LENGTH = 254
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/

function countPrimary(stack: unknown): number {
    return (Array.isArray(stack) ? stack : []).reduce<number>(
        (total, group) =>
            total +
            (isRecord(group) && Array.isArray(group.items)
                ? group.items.filter((item) => isRecord(item) && item.isPrimary === true).length
                : 0),
        0
    )
}

function validateLocation(location: unknown, path: string, issues: ContentIssue[]): void {
    if (!checkObjectKeys(location, path, ["city", "region", "countryCode"], ["detail"], issues)) {
        return
    }
    requireText(location, "city", path, issues)
    requireText(location, "region", path, issues)
    requireText(location, "detail", path, issues)
    if ("countryCode" in location && !COUNTRY_CODE_PATTERN.test(String(location.countryCode))) {
        issues.push({
            path: `${path}.countryCode`,
            message: "Deve ser um código ISO 3166-1 alfa-2 em maiúsculas (ex.: BR)"
        })
    }
}

function validateContact(contact: unknown, path: string, issues: ContentIssue[]): void {
    if (!checkObjectKeys(contact, path, ["email"], ["responseTime"], issues)) {
        return
    }
    const email = String(contact.email)
    if ("email" in contact && (!EMAIL_PATTERN.test(email) || email.length > MAX_EMAIL_LENGTH)) {
        issues.push({ path: `${path}.email`, message: `E-mail inválido: ${email}` })
    }
    if ("responseTime" in contact) {
        const responseTimePath = `${path}.responseTime`
        if (
            checkObjectKeys(contact.responseTime, responseTimePath, ["label"], ["detail"], issues)
        ) {
            requireText(contact.responseTime, "label", responseTimePath, issues)
            requireText(contact.responseTime, "detail", responseTimePath, issues)
        }
    }
}

function validateLinks(links: unknown, path: string, issues: ContentIssue[]): void {
    if (!checkObjectKeys(links, path, [], ["github", "linkedin"], issues)) {
        return
    }
    for (const key of ["github", "linkedin"]) {
        if (key in links && !isHttpsUrl(links[key])) {
            issues.push({ path: `${path}.${key}`, message: "Deve ser uma URL https: absoluta" })
        }
    }
}

function validateProfile(snapshot: ContentSnapshot): ContentIssue[] {
    const issues: ContentIssue[] = []

    for (const lang of SUPPORTED_LANGUAGES) {
        const profile = snapshot.languages[lang].profile
        const path = `content/${lang}/profile.json#`

        if (!profile || !checkObjectKeys(profile, path, REQUIRED_KEYS, ["photo"], issues)) {
            continue
        }
        requireText(profile, "role", path, issues)
        requireText(profile, "summary", path, issues)
        requireText(profile, "homeIntro", path, issues, MAX_HOME_INTRO_LENGTH)
        validateLocation(profile.location, `${path}location`, issues)
        validateContact(profile.contact, `${path}contact`, issues)
        validateLinks(profile.links, `${path}links`, issues)
        validateStack(profile.stack, `${path}stack`, 0, issues)

        const availabilityPath = `${path}availability`
        if (
            checkObjectKeys(
                profile.availability,
                availabilityPath,
                ["isAvailable", "label"],
                [],
                issues
            )
        ) {
            requireBoolean(profile.availability, "isAvailable", availabilityPath, issues)
            requireText(profile.availability, "label", availabilityPath, issues)
        }

        const paragraphs = validateStringList(
            profile.aboutParagraphs,
            `${path}aboutParagraphs`,
            issues
        )
        if (paragraphs.length < 1) {
            issues.push({
                path: `${path}aboutParagraphs`,
                message: "Informe pelo menos um parágrafo"
            })
        }
        validateStringList(profile.workPrinciples, `${path}workPrinciples`, issues)

        if (countPrimary(profile.stack) > 1) {
            issues.push({
                path: `${path}stack`,
                message: "No máximo um item da stack do site pode ter isPrimary"
            })
        }
    }

    return issues
}

export default validateProfile
