# Tasks: README da Fatec e origem da publicação

> Spec: `./spec.md`

## Plano de execução

```
Fase 1 (T1 [P] e T2 [P])  →  Fase 2 (T3)  →  Fase 3 (T4 [P] e T5 [P])  →  Fase 4 (T6)
```

Pré-requisito: o PO responde as questões em aberto 1 a 5 da spec; mudou a resposta, a spec volta para ajuste antes do `executor`.

## Tarefas

- [x] T1 [P] — Modelo e renderização do README da Fatec
    - **Arquivo(s):** `scripts/fatecReadme.template.md`, `scripts/renderFatecReadme.ts`, `scripts/test/renderFatecReadme.test.ts`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - tag fora de `^v1\.[0-9]+\.[0-9]+$` falha em português (CA3) em `scripts/test/renderFatecReadme.test.ts`
        - SHA que não é hexadecimal de 7 a 40 caracteres falha (CA3), mesmo arquivo
        - texto renderizado traz a tag, o SHA curto e `fatec-pages.yml` com link na tag (CA1), mesmo arquivo
        - nenhum `{{` sobra após renderizar (CA3), mesmo arquivo
        - texto traz as duas imagens `docs/readme/home-light.png` e `home-dark.png` em `<picture>` (CA2), mesmo arquivo
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 scripts/test/renderFatecReadme.test.ts`
    - **Feito quando:** o gate passa e cada teste listado existe
    - **Evidência:** (executor)

- [x] T2 [P] — Mensagem do commit com a origem e escopo do `git add`
    - **Arquivo(s):** `.github/workflows/fatec-pages.yml`, `scripts/test/fatecPagesWorkflow.test.ts`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - o passo `Commit and push` recebe `TAG` e `ORIGIN_SHA` por `env:` e o `run` não contém `${{` (CA4, CA6) em `scripts/test/fatecPagesWorkflow.test.ts`
        - o `run` grava a linha `Origem: felipe-sant/portfolio-frontend@` com o SHA e `(tag ` com a tag (CA4), mesmo arquivo
        - o assunto continua `Publica a $TAG do portfólio` (CA4), mesmo arquivo
        - `git add` recebe só `docs` e `README.md` (CA5), mesmo arquivo
        - sem `--force`, `permissions` e token intactos (CA6), testes já existentes seguem verdes
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 scripts/test/fatecPagesWorkflow.test.ts`
    - **Feito quando:** o gate passa; o SHA vem de `git rev-parse --short HEAD` no checkout da tag
    - **Evidência:** (executor)

- [x] T3 — Escrita do README e da captura no clone da Fatec
    - **Arquivo(s):** `scripts/writeFatecReadme.ts`, `scripts/publishFatecReadme.ts`, `package.json` (script `publish:fatec:readme`), `scripts/test/writeFatecReadme.test.ts`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):**
        - clone inexistente falha em português sem criar nada (CA3) em `scripts/test/writeFatecReadme.test.ts`
        - PNG de origem ausente falha em português sem tocar o destino (CA2), mesmo arquivo
        - grava `README.md` renderizado na raiz do destino e só ele (CA1, CA5), mesmo arquivo
        - copia `home-light.png` e `home-dark.png` para `docs/readme/` depois de o `docs/` ter sido trocado (CA2), mesmo arquivo
        - imagem acima de 300 KB falha (CA2), mesmo arquivo
        - rodar duas vezes produz o mesmo resultado (idempotência), mesmo arquivo
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 scripts/test/writeFatecReadme.test.ts scripts/test/replaceFatecDocs.test.ts`
    - **Feito quando:** o gate passa; `replaceFatecDocs` sem alteração
    - **Evidência:** (executor)

- [x] T4 [P] — Ligar o script ao job `publish`
    - **Arquivo(s):** `.github/workflows/fatec-pages.yml`, `scripts/test/fatecPagesWorkflow.test.ts`
    - **Depende de:** T2, T3
    - **Testes (escritos antes, RED):**
        - o passo com `npm run publish:fatec:readme` vem depois de `publish:fatec:docs` e antes do commit (CA2) em `scripts/test/fatecPagesWorkflow.test.ts`
        - tag e SHA chegam ao passo por `env:`, nunca em `${{ }}` no `run` (CA6), mesmo arquivo
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 scripts/test/fatecPagesWorkflow.test.ts`
    - **Feito quando:** o gate passa
    - **Evidência:** (executor)

- [x] T5 [P] — Documentação
    - **Arquivo(s):** `docs/setup/environments.md`
    - **Depende de:** T3
    - **Testes (escritos antes, RED):** não se aplica (documentação); `scripts/test/readme.test.ts` segue verde (CA7)
    - **Gate:** `npm run lint && npm test -- --run --maxWorkers=2 scripts/test/readme.test.ts`
    - **Feito quando:** a seção Fatec descreve o README mantido (modelo, imagens em `docs/readme/`, aviso de sobrescrita), o passo 4 e 5 do `publish` com a mensagem e a linha `Origem:`, o Plano B manual com o README, a nota de metadados "não feito por falta de permissão" e o comando `gh repo edit`; a frase "Nada fora de `docs/` muda, inclusive o `README.md`" foi corrigida
    - **Evidência:** (executor)

- [ ] T6 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** T1 a T5
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run test:cov -- --maxWorkers=2` (única rodada pesada; conferir `uptime` antes). Depois, `npm run changeset -- --empty` no PR
    - **Feito quando:** o gate passa
    - **Evidência:** (executor)

## Verificação manual (pós-release, fora do TDD)

- Abrir o README da Fatec após a próxima release: imagem nos dois temas, links, versão e SHA. `git log -1` mostra a linha `Origem:`. Nenhuma publicação antes da aprovação da spec e da release.
