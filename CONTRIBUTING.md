# Contribuindo

Este documento é a fonte, para humanos, do fluxo de trabalho deste repositório: issue, branch, commit, Pull Request, changeset e verificação. As regras de código e de agentes de IA ficam em [`.claude/CLAUDE.md`](.claude/CLAUDE.md), que mantém um resumo operacional deste fluxo para os agentes aplicarem sozinhos; os dois não se contradizem. Para preparar o ambiente e rodar o projeto, veja [`docs/setup/development.md`](docs/setup/development.md).

## Tipos de alteração

| Tipo     |     Ícone     | Código do ícone | Descrição                                                                   |
| -------- | :-----------: | --------------- | --------------------------------------------------------------------------- |
| Fix      |     :bug:     | bug             | Correção de bugs.                                                           |
| Feat     |  :sparkles:   | sparkles        | Desenvolvimento de novas funcionalidades (features).                        |
| Hotfix   |  :ambulance:  | ambulance       | Correção de bugs a partir da branch de produção (main).                     |
| Refactor |   :recycle:   | recycle         | Melhorias no código (ex.: reestruturações; melhorias no código).            |
| Test     |  :test_tube:  | test_tube       | Criação ou alteração de arquivos de teste.                                  |
| Perf     |     :zap:     | zap             | Mudanças a fim de melhorar a performance.                                   |
| Style    |     :art:     | art             | Mudanças apenas em estilo de código (ex.: formatação; clean code).          |
| Docs     |    :bulb:     | bulb            | Mudanças relacionadas à documentação.                                       |
| Build    |   :rocket:    | rocket          | Mudanças em arquivos de build (ex.: Vite; `package.json`).                  |
| Chore    | :see_no_evil: | see_no_evil     | Mudanças sem impacto direto na aplicação (ex.: alterações no `.gitignore`). |
| Revert   |   :rewind:    | rewind          | Reverter algum commit.                                                      |

> `<Tipo>` vem sempre desta tabela. O tipo da issue vive no campo `Tipo` do Projeto e o da mudança, na branch, no commit e no título do PR; nenhum deles é label do GitHub.

## Issues

Toda issue entra no projeto [Portfolio](https://github.com/users/felipe-sant/projects/16), que reúne os repositórios do portfólio, com:

- **Status** `Backlog` (o PO revisa e move);
- **Marco** do [`docs/product/roadmap.md`](docs/product/roadmap.md), ou `Pessoal` para a trilha fora da v1;
- um único **Tipo**: `FEAT`, `DOC` ou `BUG`.

Labels de tipo não são usadas; as labels indicam só a área: `frontend`, `backend`, `infra`, uma ou mais. Toda issue que depende de outra registra a relação como "blocked by" do GitHub, além da linha "Depende de" do corpo.

## Padrão de branches

```
<tipo>/<número-da-issue>-<descrição-curta(opcional)>
```

Exemplo:

```
feat/21-agentes-e-skills
```

Sem issue aberta, o número pode ser omitido:

```
chore/update-gitignore
```

### Branches de ambiente

- **`staging`**: ambiente de testes e base do desenvolvimento. Toda branch de trabalho nasce de `origin/staging` atualizada e volta para ela por PR.
- **`main`**: produção. Só recebe PR vindo de `staging` (promoção do que foi validado) ou de `hotfix/*`.

Nenhuma das duas recebe push direto. Hotfix nasce de `origin/main`, volta por PR para a `main` e, depois do merge, a `main` é levada de volta para a `staging` por PR.

## Padrão de commits

```
<Tipo> <ícone> [#<número-da-issue>] <descrição-da-alteração>
```

Exemplo:

```
Fix :bug: [#5] Troca <a href> por <Link> na página NotFound
```

Sem issue relacionada, omita o `[#...]`:

```
Chore :see_no_evil: Atualiza .gitignore
```

Commits são atômicos: uma mudança concluída por commit, não várias tarefas acumuladas.

## Changeset

Todo PR para a `staging` traz um changeset, commitado no próprio PR (o job `changeset-check.yml` falha sem ele):

- `npm run changeset` com o tipo (`major`, `minor` ou `patch`) da regra de incremento de [`docs/product/roadmap.md`](docs/product/roadmap.md);
- `npm run changeset -- --empty` quando a mudança não altera a versão (documentação, CI, testes);
- `hotfix/*` leva um changeset `patch` e roda `npm run changeset:version` antes do PR (com `GITHUB_TOKEN` no ambiente, para o CHANGELOG linkar PR e commit).

Como a versão sobe e o CHANGELOG é gerado: [`docs/setup/environments.md#versionamento-changesets`](docs/setup/environments.md#versionamento-changesets).

## Antes de abrir o PR

Rode e deixe verdes, os mesmos comandos do CI:

```bash
npm run lint
npm test -- --run
npm run build
```

O `npm run build` já roda o `typecheck`. Mudança de tela também se confere no navegador (`npm run dev`).

## Pull Requests

- Toda alteração passa por PR para a `staging`, sem push direto (exceção: `hotfix/*`, que vai para a `main`).
- A promoção para produção é um PR de `staging` para `main`, com título no padrão de commit (ex.: `Chore :see_no_evil: Promove staging para produção`) e a lista das issues incluídas.
- Ao abrir o PR, o autor se atribui já na criação (ex.: `gh pr create --assignee @me`) e aplica as labels de área da issue (`frontend`, `backend`, `infra`).
- Referencie a issue relacionada na descrição (ex.: `Closes #5`). A branch padrão do repositório é a `staging`, então a issue fecha no merge do PR para a `staging`; o PR de promoção `staging` → `main` não repete o `Closes`.
- O título do PR segue o mesmo padrão do commit principal (`<Tipo> <ícone> [#<número>] <descrição>`).
- A descrição segue a estrutura de [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md), não um corpo livre.

## Uso de IA e revisão humana

O projeto usa o Claude Code como parceiro de desenvolvimento e deixa isso à vista: os commits levam o trailer `Co-Authored-By` e os PRs, a assinatura da ferramenta. A política completa está na seção "Como este projeto é feito" do [`README.md`](README.md#como-este-projeto-é-feito) e os agentes são descritos em [`.claude/README.md`](.claude/README.md).

Como o projeto tem um único autor, a revisão do agente não substitui a leitura humana: o item "Revisão humana feita" do template de PR registra o que foi lido, testado ou corrigido à mão antes do merge.
