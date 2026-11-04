import bash from "highlight.js/lib/languages/bash"
import java from "highlight.js/lib/languages/java"
import javascript from "highlight.js/lib/languages/javascript"
import json from "highlight.js/lib/languages/json"
import properties from "highlight.js/lib/languages/properties"
import python from "highlight.js/lib/languages/python"
import typescript from "highlight.js/lib/languages/typescript"

const CODE_LANGUAGES = {
    typescript,
    javascript,
    tsx: typescript,
    java,
    python,
    json,
    bash,
    env: properties
}

export default CODE_LANGUAGES
