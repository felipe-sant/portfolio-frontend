import projectPath from "./projectPath"
import readProjectDetail from "./readProjectDetail"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const PROJECT_TITLE = "MNIST Classifier"
const PROJECT_ID = readProjectDetail("pt-BR", PROJECT_TITLE).id

const PROJECT_ROUTES = LANGUAGES.flatMap((language) => [
    projectPath(language, PROJECT_ID),
    projectPath(language, PROJECT_ID, "SETUP.md"),
    projectPath(language, PROJECT_ID, "ARCHITECTURE.md")
])

const ROUTES_UNDER_TEST = [
    "pt-BR",
    "en",
    "es",
    "pt-BR/projects",
    "en/projects",
    "es/projects",
    ...PROJECT_ROUTES,
    projectPath("pt-BR", PROJECT_ID, "LICENSE"),
    "pt-BR/rota-inexistente"
]

export default ROUTES_UNDER_TEST
