const PROJECT_PHRASE =
    "PR de versão gerado pelo changesets. Ao mesclar, a versão e o CHANGELOG entram na `staging` e a promoção para `main` segue o fluxo de `docs/setup/environments.md`. Enquanto ele estiver aberto, a promoção fica bloqueada (PR em draft)."

const DEFAULT_PARAGRAPH = /This PR was opened by the .*?this PR will be updated\./s

function replaceVersionPrBoilerplate(body: string) {
    return body.replace(DEFAULT_PARAGRAPH, () => PROJECT_PHRASE)
}

export default replaceVersionPrBoilerplate
