# Contribuindo

Este documento define o padrão de branches, commits e Pull Requests deste repositório, adaptado para um repositório único, sem board de tarefas — issues do GitHub substituem o número de tarefa.

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

> `<Tipo>` vem sempre desta tabela. Não use label do GitHub (`enhancement`, `bug` como label, etc.) no lugar do tipo da branch/commit — a label classifica a issue, o tipo classifica a mudança.

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

## Pull Requests

- Toda alteração passa por PR para a `main` — sem push direto.
- Ao abrir o PR, preencha: **assignees** e **labels** (use as labels já existentes no repositório: `bug`, `enhancement`, `documentation`, etc.).
    - **Assignee**: por padrão, o autor do PR se auto-atribui já na criação (ex.: `gh pr create --assignee @me`), sem depender de edição posterior.
- Referencie a issue relacionada na descrição (ex.: `Closes #5`) para que ela seja fechada automaticamente no merge.
- O título do PR segue o mesmo padrão do commit principal (`<Tipo> <ícone> [#<número>] <descrição>`).
- A descrição segue a estrutura de `.github/PULL_REQUEST_TEMPLATE.md`, não um corpo livre.
