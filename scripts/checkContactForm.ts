import findContactFormInBuild from "@scripts/contactForm/findContactFormInBuild"

const buildDirectory = process.argv[2] ?? "dist"

try {
    const reasons = await findContactFormInBuild(buildDirectory)

    if (reasons.length === 0) {
        console.log(`Nenhum formulário de Contato em ${buildDirectory}.`)
    } else {
        console.log(
            `O build em ${buildDirectory} contém o formulário de Contato, cujo envio é simulado (#158, #44):`
        )
        for (const reason of reasons) {
            console.log(`- ${reason}`)
        }
        console.log(
            'Desligue VITE_CONTACT_FORM_ENABLED (ausente ou diferente de "true") no ambiente do build.'
        )
        process.exitCode = 1
    }
} catch (error) {
    console.log(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
}
