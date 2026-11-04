import enAbout from "@/locales/en/about.json"
import enCommon from "@/locales/en/common.json"
import enContact from "@/locales/en/contact.json"
import enError from "@/locales/en/error.json"
import enHome from "@/locales/en/home.json"
import enNotFound from "@/locales/en/notFound.json"
import enProject from "@/locales/en/project.json"
import enProjects from "@/locales/en/projects.json"
import esAbout from "@/locales/es/about.json"
import esCommon from "@/locales/es/common.json"
import esContact from "@/locales/es/contact.json"
import esError from "@/locales/es/error.json"
import esHome from "@/locales/es/home.json"
import esNotFound from "@/locales/es/notFound.json"
import esProject from "@/locales/es/project.json"
import esProjects from "@/locales/es/projects.json"
import ptBRAbout from "@/locales/pt-BR/about.json"
import ptBRCommon from "@/locales/pt-BR/common.json"
import ptBRContact from "@/locales/pt-BR/contact.json"
import ptBRError from "@/locales/pt-BR/error.json"
import ptBRHome from "@/locales/pt-BR/home.json"
import ptBRNotFound from "@/locales/pt-BR/notFound.json"
import ptBRProject from "@/locales/pt-BR/project.json"
import ptBRProjects from "@/locales/pt-BR/projects.json"

const ptBR = {
    common: ptBRCommon,
    contact: ptBRContact,
    home: ptBRHome,
    notFound: ptBRNotFound,
    error: ptBRError,
    projects: ptBRProjects,
    project: ptBRProject,
    about: ptBRAbout
}

const en: typeof ptBR = {
    common: enCommon,
    contact: enContact,
    home: enHome,
    notFound: enNotFound,
    error: enError,
    projects: enProjects,
    project: enProject,
    about: enAbout
}

const es: typeof ptBR = {
    common: esCommon,
    contact: esContact,
    home: esHome,
    notFound: esNotFound,
    error: esError,
    projects: esProjects,
    project: esProject,
    about: esAbout
}

const resources = {
    "pt-BR": ptBR,
    en,
    es
}

export default resources
