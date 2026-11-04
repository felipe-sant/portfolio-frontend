import readRawProjects from "./readRawProjects"
import toProjectRecord from "./toProjectRecord"

function readProjects(language: string) {
    return readRawProjects(language).map(toProjectRecord)
}

export default readProjects
