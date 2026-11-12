# Spec: README da Fatec e origem da publicação

> **Tipo:** `feature` <br />
> **Status:** `em-revisao` <br />
> **Issue:** `#157` <br />
> **Criado em:** `11-11-2026`

## Problema

O repositório da Fatec (`fatec-jacarei-dsm-portfolio/ra2581392423047`) é o que o professor abre, e ele não diz de onde veio o que está publicado:

- O `README.md` dele (59 linhas, sem imagem) não cita a versão publicada nem o workflow `fatec-pages.yml`, e a seção "Versão" só diz "v1". Nenhum arquivo deste repositório gera esse README: o job `publish` só faz `git add --all docs`, então ele só muda por edição manual na Fatec.
- O commit automático (`Publica a v1.2.0 do portfólio`) não traz o commit de origem; para saber de qual código veio o `docs/`, é preciso cruzar datas.
- A API do GitHub devolve homepage vazia, nenhum topic e descrição em branco. Isso exige permissão de administrador, que o PO não tem (`gh api`: `admin=false`, `maintain=false`, `push=true`).

Origem: revisão de código de 08/11/2026 (F-01, F-02, F-03).

## Objetivo

1. O README da Fatec passa a ser mantido por este repositório: um modelo versionado, renderizado e copiado pelo job `publish` a cada release, que cita a versão publicada (tag e commit de origem), cita o workflow `fatec-pages.yml` e mostra uma captura da tela Início.
2. O commit de publicação grava a origem: `Publica a v1.3.0 do portfólio`, linha em branco e `Origem: felipe-sant/portfolio-frontend@<sha curto> (tag v1.3.0)`.
3. Homepage, descrição e topics: não são feitos agora (sem permissão); a spec e `docs/setup/environments.md` deixam o comando pronto.

## Fora de escopo

- LICENSE na raiz da Fatec (decisão do PO em 11/11/2026) e qualquer outro arquivo da raiz da Fatec além do `README.md`.
- Homepage, descrição e topics do repositório da Fatec (ver "Notas / decisões": sem permissão).
- Publicar qualquer coisa no repositório da Fatec antes da aprovação desta spec; a primeira publicação com o README novo acontece só pelo workflow, numa próxima release.
- Mudar o build, o `docs/` publicado (além das imagens da captura) ou o `release.yml`.
- Gerar a captura no CI (sem Playwright no job `publish`).

## Casos de borda

- QUANDO o README renderizado e o capturas já estão iguais aos da Fatec e o `docs/` não mudou ENTÃO o job DEVE terminar sem commit (`git status --porcelain` vazio), como hoje.
- QUANDO a mesma tag é publicada de novo ENTÃO o commit só existe se algo mudou (a mensagem não cria diferença sozinha).
- QUANDO o modelo ou o artefato não existe/está inválido ENTÃO a etapa DEVE falhar em português, sem tocar o destino.
- QUANDO a tag não bate com `^v1\.[0-9]+\.[0-9]+$` ENTÃO o script DEVE recusar (defesa em profundidade; o workflow já filtra).
- QUANDO o README da Fatec tem edição manual ENTÃO ela é sobrescrita na próxima publicação; o README renderizado avisa isso.

## Critérios de aceite

Sem tela nova no frontend (mudança de CI, script e documentação): o `qa` não executa E2E de tela; verifica o workflow e a documentação.

- [ ] CA1 (README cita versão e workflow): o README renderizado contém a tag (`v1.3.0`), o SHA curto de origem e o nome `fatec-pages.yml` com link ao arquivo na tag. Teste: `scripts/test/renderFatecReadme.test.ts`.
- [ ] CA2 (captura): o README renderizado referencia `docs/readme/home-light.png` e `docs/readme/home-dark.png` (par `<picture>`, mesmo padrão do README de origem), os dois PNG são copiados para `docs/readme/` do destino depois da troca do `docs/`, e cada um pesa até 300 KB. Teste: `scripts/test/publishFatecReadme.test.ts`.
- [ ] CA3 (substituição do placeholder): modelo sem `{{TAG}}`/`{{SHA}}` restante após a renderização; tag inválida e SHA que não seja hexadecimal de 7 a 40 caracteres falham. Teste: `scripts/test/renderFatecReadme.test.ts`.
- [ ] CA4 (commit com origem): o `run` do passo `Commit and push` monta a mensagem com a tag e o SHA curto, em `env:` (nunca `${{ }}` no `run`), e o commit contém a linha `Origem: felipe-sant/portfolio-frontend@<sha> (tag <tag>)`. Teste: `scripts/test/fatecPagesWorkflow.test.ts`.
- [ ] CA5 (escopo do `git add`): só `docs` e `README.md` entram no commit da Fatec; nada mais da raiz. Teste: `scripts/test/fatecPagesWorkflow.test.ts`.
- [ ] CA6 (sem regressão): demais testes do workflow e de `replaceFatecDocs` seguem verdes; sem `--force`; `permissions: contents: read` mantido; token só em `with`/`env`.
- [ ] CA7 (limites do README de origem): `scripts/test/readme.test.ts` segue verde (100 linhas, 300 KB por imagem, ordem de docs).
- [ ] CA8 (documentação): `docs/setup/environments.md` descreve o README mantido, a captura, a mensagem com origem, o Plano B atualizado e o comando de homepage/descrição/topics. Verificação manual de leitura pelo `reviewer`.

## Estratégia de validação

- **Checagens automatizadas:** testes dos CA1 a CA7 com `npm test -- --run --maxWorkers=2 <arquivo>`; `npm run typecheck`; `npm run lint`. Build e `test:cov` completos na "Verificação completa" e no CI do PR.
- **Checagens manuais:** depois da próxima release, abrir o README da Fatec, conferir a imagem em tema claro e escuro, os links e o `git log -1` com a linha `Origem:`. Ensaio local antes: rodar o script de README contra um clone temporário (nunca contra o repositório real) e ler o resultado.
- **Rollback / mitigação:** `git revert` do commit de publicação na Fatec (PO), como já documentado. Se o novo passo quebrar a publicação, o Plano B manual continua válido.

## Questões em aberto (para o PO)

1. **Quem mantém o README da Fatec.** Proposta: modelo versionado aqui (`scripts/fatecReadme.template.md`), renderizado e copiado pelo `publish` a cada release (reescreve o README inteiro). Alternativa: edição manual única, sem automação (mais simples, mas a versão no README volta a ficar velha a cada release e o CA1 só vale para uma versão). Recomendo a proposta.
2. **Limite da raiz da Fatec.** A decisão de 11/11 vetou a LICENSE. Confirma que o `README.md` (que já existe na raiz e é o item de aceite) é o único arquivo da raiz que o workflow pode escrever, e que `FATEC_PAGES_TOKEN` (que já dá push em `main`) basta?
3. **Onde ficam as imagens.** Proposta: `docs/readme/` no destino (não cria pasta nova na raiz; é recriado a cada publicação e também é servido pelo Pages). Alternativa: pasta `readme/` na raiz (mais uma pasta na raiz). Recomendo `docs/readme/`.
4. **Origem da captura.** Proposta: reaproveitar os PNG já versionados e validados em `docs/design/assets/readme/` (gerados por `scripts/generateReadmeScreenshots.ts`, `readmeScreenshotPath`), da tag publicada. Eles podem estar defasados em relação à tela, e a regeneração continua manual.
5. **Mensagem do commit.** Aprova o formato com corpo `Origem: felipe-sant/portfolio-frontend@<sha curto> (tag <tag>)`, mantendo o assunto `Publica a <tag> do portfólio`?
6. **Metadados do repositório (homepage, descrição, topics).** Sem permissão, não faremos. O PO ou o professor aceita executar o comando da seção de notas, ou fechamos esse item como não feito?

## Notas / decisões

- **Metadados sem permissão.** Em 11/11/2026 o `gh api repos/fatec-jacarei-dsm-portfolio/ra2581392423047` mostrou `admin=false`, `maintain=false`, `push=true`. Editar homepage, descrição e topics exige administrador, então o item é "não feito" por falta de permissão. Comandos prontos para quem tiver administrador (documentados em `docs/setup/environments.md`):

  ```bash
  gh repo edit fatec-jacarei-dsm-portfolio/ra2581392423047 \
    --homepage "https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/" \
    --description "Portfólio de Luiz Felipe dos Santos (Fatec Jacareí, DSM): código-fonte em felipe-sant/portfolio-frontend" \
    --add-topic portfolio --add-topic react --add-topic typescript --add-topic fatec
  ```

- **Mecânica proposta.** Novo `scripts/renderFatecReadme.ts` (função pura: modelo + `{ tag, sha }` -> texto; valida tag e SHA) e `scripts/publishFatecReadme.ts` com a função de arquivo `scripts/writeFatecReadme.ts` (lê o modelo, grava `README.md` e copia os PNG para `docs/readme/` do clone), chamado pelo `publish` por um script `npm run publish:fatec:readme`, depois de `publish:fatec:docs` (que apaga `docs/`). O `replaceFatecDocs` não muda. O SHA vem de `git rev-parse --short HEAD` no checkout da tag (o passo Checkout já está na tag), passado por `env:`.
- **Modelo.** Parte do README atual da Fatec (visto em 11/11/2026), mais: versão e commit de origem, link do workflow na tag, captura em `<picture>`, aviso de sobrescrita. Segue a voz do produto (pt-BR, primeira pessoa quando couber, sem emoji, sem superlativo). O texto do README da Fatec é documentação, não UI: fica fora de R2 (idiomas), em pt-BR; o conteúdo vem de `docs/` e `scripts/`, não de `src/locales/`.
- **Natureza do commit.** Mudança de CI e script: tipo `CI`/`Build` não existe na tabela; usar `Build :rocket:` para workflow/script e `Docs :bulb:` para documentação. Branch já criada como `docs/157-...`.
- **Changeset.** Sem alteração de código de produção do site: `npm run changeset -- --empty`.
- **R1/R3.** Sem backend e sem decisão de design aplicável (`Dnn`/`PIn` não se aplicam: não há tela nova). A captura reaproveita o handoff já validado.
