import enCommon from "@/locales/en/common.json"
import enError from "@/locales/en/error.json"
import enHome from "@/locales/en/home.json"
import enNotFound from "@/locales/en/notFound.json"
import esCommon from "@/locales/es/common.json"
import esError from "@/locales/es/error.json"
import esHome from "@/locales/es/home.json"
import esNotFound from "@/locales/es/notFound.json"
import ptBRCommon from "@/locales/pt-BR/common.json"
import ptBRError from "@/locales/pt-BR/error.json"
import ptBRHome from "@/locales/pt-BR/home.json"
import ptBRNotFound from "@/locales/pt-BR/notFound.json"

const ptBR = {
    common: ptBRCommon,
    home: ptBRHome,
    notFound: ptBRNotFound,
    error: ptBRError
}

const en: typeof ptBR = {
    common: enCommon,
    home: enHome,
    notFound: enNotFound,
    error: enError
}

const es: typeof ptBR = {
    common: esCommon,
    home: esHome,
    notFound: esNotFound,
    error: esError
}

const resources = {
    "pt-BR": ptBR,
    en,
    es
}

export default resources
