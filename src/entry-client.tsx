import mountClient from "@/prerender/mountClient"

const rootElement = document.getElementById("root")

if (!rootElement) {
    throw new Error("Elemento #root não encontrado no documento")
}

mountClient(rootElement)
