const TRANSLATABLE_PATHS = {
    profile: [
        "role",
        "homeIntro",
        "summary",
        "availability.label",
        "location.city",
        "location.region",
        "location.detail",
        "contact.responseTime.label",
        "contact.responseTime.detail",
        "aboutParagraphs[]",
        "workPrinciples[]"
    ],
    timeline: [
        "items[].title",
        "items[].organization",
        "items[].stage",
        "items[].details[]",
        "items[].summary",
        "items[].responsibilities[]",
        "items[].disciplines[]",
        "items[].certificates[].name",
        "items[].certificates[].issuer"
    ],
    projects: [
        "items[].title",
        "items[].summary",
        "items[].role",
        "items[].duration",
        "items[].team",
        "items[].images[].alt",
        "items[].images[].caption"
    ]
}

export default TRANSLATABLE_PATHS
