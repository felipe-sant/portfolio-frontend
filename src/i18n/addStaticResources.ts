import i18n from "@/i18n/i18n"
import resources from "@/i18n/resources"

function addStaticResources() {
    for (const [language, namespaces] of Object.entries(resources)) {
        for (const [namespace, bundle] of Object.entries(namespaces)) {
            i18n.addResourceBundle(language, namespace, bundle, true, true)
        }
    }
}

export default addStaticResources
