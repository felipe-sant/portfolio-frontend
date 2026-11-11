# Changesets

Todo PR para a `staging` traz um changeset (`npm run changeset`), com o tipo (`major`, `minor` ou `patch`) da regra de incremento de `docs/product/roadmap.md#versionamento`. Quando a mudança não altera a versão (documentação, CI, testes ou tooling, como agentes e skills em `.claude/` e configuração de lint ou editor), o changeset é vazio (`npm run changeset -- --empty`). Detalhe em `CONTRIBUTING.md` e `docs/setup/environments.md#versionamento-changesets`.
