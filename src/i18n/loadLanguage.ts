import i18n from "@/i18n/i18n"
import LANGUAGE_BUNDLE_IMPORTERS from "@/i18n/languageBundleImporters"
import NAMESPACES from "@/i18n/namespaces"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

const pendingLoads = new Map<SupportedLanguage, Promise<void>>()

function hasAllNamespaces(language: SupportedLanguage): boolean {
    return NAMESPACES.every((namespace) => i18n.hasResourceBundle(language, namespace))
}

async function importLanguage(language: SupportedLanguage): Promise<void> {
    const { default: bundle } = await LANGUAGE_BUNDLE_IMPORTERS[language]()

    for (const [namespace, resources] of Object.entries(bundle)) {
        i18n.addResourceBundle(language, namespace, resources, true, true)
    }
}

function loadLanguage(language: SupportedLanguage): Promise<void> {
    if (hasAllNamespaces(language)) {
        return Promise.resolve()
    }

    const pending = pendingLoads.get(language)

    if (pending) {
        return pending
    }

    const load = importLanguage(language).finally(() => {
        pendingLoads.delete(language)
    })
    pendingLoads.set(language, load)

    return load
}

export default loadLanguage
