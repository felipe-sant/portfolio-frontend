# Spec: versiona-specs-na-branch

> **Tipo:** `feature` (Chore, branch `chore/217-versiona-specs-na-branch`) <br />
> **Status:** `implementada` <br />
> **Issue:** `#217` <br />
> **Criado em:** `11-11-2026`

Mudança só de processo, documentação e configuração (`.gitignore`, `.claude/`, `docs/`). Não tem tela (o `qa` não se aplica), não cria texto de UI (R2 não se aplica), não depende de backend (R1 não se aplica) e não toca em design (R3 não se aplica). Não há lógica nova: não há teste de unidade novo; a verificação é por `grep`, `git check-ignore` e pelo teste existente `scripts/test/contributingTypesTable.test.ts`.

## Problema

A spec de uma feature fica só na máquina de quem a escreveu: `.gitignore` ignora `.specs/bugs/*/` e `.specs/features/*/`. Sessões isoladas de agentes (worktrees) não enxergam a spec, e o `executor` precisa criar a branch por conta própria, separada de onde a spec nasceu. O passo de arquivar um resumo em `_archive/` existe só para compensar a spec não ser versionada.

## Objetivo

A spec nasce na branch da feature, é commitada nela e viaja com o PR. Ao fim, o processo é:

1. O `sdd` cria a branch da feature a partir de `origin/staging` atualizada, com o nome `<tipo>/<número-da-issue>-<descrição-curta>` (seção "Branches" do `CLAUDE.md`), escreve `spec.md` e `tasks.md` e os commita nela (commit `Docs`, formato do `CLAUDE.md`).
2. O `executor` só muda para essa branch (`git switch <branch>`); nunca cria branch.
3. Spec de feature em andamento é versionada; spec concluída deixa de existir na árvore e fica só no histórico e nos resumos `_archive/<slug>.md` que já existem (intactos).
4. Sai do fluxo a regra "nunca commitar a spec" e o `reviewer` deixa de tratar spec commitada como bloqueante.
5. O passo "escrever o resumo em `_archive/`" sai do fluxo e dos modelos.

Nesta própria issue (bootstrap): a branch `chore/217-versiona-specs-na-branch` já existe e é a branch da feature; o `sdd` não a recria. Como `.gitignore` ainda ignora a pasta desta spec, a primeira tarefa remove a regra e commita a spec junto.

## Fora de escopo

- Migrar as cerca de 35 pastas de spec locais que existem na máquina do PO (na pasta principal, fora deste worktree). Elas não entram em bloco: só as das specs ativas serão versionadas, e a escolha de quais são ativas e a migração são ação do PO depois deste PR, não tarefa do `executor`.
- Editar, mover ou apagar os resumos existentes em `.specs/features/_archive/*.md` e `.specs/bugs/_archive/*.md` (54 arquivos, contando os modelos).
- Alterar `.github/workflows/ci.yml`, `.github/PULL_REQUEST_TEMPLATE.md` ou `CONTRIBUTING.md` (não citam o arquivamento nem a regra de spec; confirmado por `grep`).
- Automatizar a limpeza da spec concluída por script ou CI.

## Critérios de aceite

Os cinco primeiros espelham a issue #217; o sexto cobre a documentação.

- [x] CA1: `.claude/agents/sdd.md` manda criar a branch da feature a partir de `origin/staging` atualizada (nome pelo padrão do `CLAUDE.md`; se a branch já existir, apenas mudar para ela), escrever a spec nela e commitá-la num commit `Docs`; o `Bash` do `sdd` passa a permitir `git fetch`, `git switch`, `git add` e `git commit` restritos a arquivos de `.specs/`.
- [x] CA2: `.claude/agents/executor.md` só muda para a branch da spec e nunca cria branch; não resta o trecho `git switch -c`.
- [x] CA3: `git check-ignore .specs/features/x/spec.md .specs/bugs/x/spec.md` sai vazio; `.gitignore` não tem as quatro linhas de `.specs`; os resumos em `_archive/` continuam como estão (`git diff --stat` sem alterações neles, exceto a decisão sobre os `_TEMPLATE.md`).
- [x] CA4: nenhum arquivo de `.claude/` ou `docs/` diz que spec é "gitignored", "planejamento local" ou "nunca commite"; `reviewer.md` não tem mais o bloqueante de spec commitada.
- [x] CA5: `.claude/CLAUDE.md` (bloco `.specs/`), `.claude/README.md` (bloco `.specs/` e papel do `sdd`) e `docs/README.md` (linha "Versionada") descrevem o novo processo, sem o passo de arquivar resumo.
- [x] CA6: `npm run typecheck`, `npm run lint` e `npm test -- --run scripts/test/contributingTypesTable.test.ts` passam; a suíte completa passa na última tarefa.

## Casos de borda

- QUANDO o `sdd` é chamado com árvore suja ENTÃO ele DEVE parar e avisar (como hoje), sem criar branch.
- QUANDO o pedido não tem issue ENTÃO a branch omite o número (`chore/update-gitignore`, regra do `CLAUDE.md`).
- QUANDO o `sdd` é chamado numa branch já criada para a feature (caso desta issue) ENTÃO ele DEVE usá-la, sem criar outra e sem fazer checkout de `staging`.
- QUANDO o PO pede explicitamente para planejar sobre uma branch que não é `staging` ENTÃO a exceção atual do `sdd.md` continua valendo.

## Estratégia de validação

- **Checagens automatizadas:** `npm run typecheck`; `npm run lint`; `npm test -- --run scripts/test/contributingTypesTable.test.ts` (prova que a tabela de tipos segue igual em `CONTRIBUTING.md` e `.claude/CLAUDE.md`, que será editado); suíte completa só na última tarefa.
- **Checagens por comando (sem teste de unidade, pois não há lógica):** `git check-ignore`, `grep -rniE "gitignored|planejamento local|nunca commite" .claude docs`, `grep -rn "_archive" .claude docs`, `git diff --stat -- .specs/*/_archive`.
- **Checagens manuais:** o PO lê os três agentes alterados e confirma o fluxo.
- **Rollback:** reverter o commit do `.gitignore` e dos agentes; as pastas de spec voltam a ser ignoradas.

## Questões em aberto

1. **Spec concluída (decisão b):** quando a spec chega a `implementada`, ela fica na árvore após o merge ou é removida no PR? Recomendação: o `executor` remove a pasta da spec (`git rm -r`, commit `Docs` próprio, antes de abrir o PR) depois de `implementada`; o histórico da branch preserva o texto e a árvore não acumula specs mortas, o que satisfaz o critério "concluídas só pelos resumos existentes" da issue. Esta spec é escrita assumindo a recomendação (tarefa T3 e T4); se o PO preferir manter a pasta, remover essa linha do `executor.md`.
2. **Modelos `_archive/_TEMPLATE.md` (features e bugs):** recomendação: remover os dois, pois o arquivamento deixa de existir e um modelo sem uso induz a escrever resumo; os 52 resumos ficam intactos. Alternativa: marcá-los como legado. A tarefa T6 assume a remoção.
3. **Quais specs locais são "ativas"** e entram no repositório: decisão e ação do PO depois do PR, fora do `executor`.
4. **Permissão do `sdd` e tamanho do commit:** o `sdd.md` não tem como o sistema impedir `git add` fora de `.specs/`; a restrição é por regra escrita no agente (`git add .specs/...` explícito, nunca `git add -A`), e o `reviewer` confere o diff. Aceitável?

## Notas / decisões

- **CI (decisão c):** `.github/workflows/ci.yml` linha 163 já classifica `.specs/*` (ao lado de `docs/*`, `.claude/*`) como sem impacto no E2E; spec commitada em PR não dispara a suíte E2E. Nenhuma mudança no CI. `scripts/test/ciWorkflow.test.ts` não referencia `.specs`.
- **`scripts/test/contributingTypesTable.test.ts`:** só compara a tabela "Tipos" de `CONTRIBUTING.md` e `.claude/CLAUDE.md`; a edição prevista (bloco `.specs/` em "Tooling de IA") não toca a tabela. Rodá-lo no gate prova isso. Não é afetado por mais nada.
- **Outras menções varridas:** `grep` por `_archive`, `gitignore`, `.specs` em `docs/`, `CONTRIBUTING.md` e `.claude/` achou só: `docs/README.md` (tabela `docs` vs `.specs`), `.claude/README.md` (linhas 11, 42, 63-65), `.claude/CLAUDE.md` (linha 248), `.claude/agents/{sdd,executor,reviewer}.md`. `docs/architecture/code-structure.md` (linhas 183 e 307) cita `.specs/` apenas como lugar de decisões e de checagem de dependência: continua verdadeiro. `tester.md` cita a spec em `.specs/`: continua verdadeiro. Os `gitignore` de `docs/setup/*` falam de `dist-server/`, `coverage/` e timings, não de spec.
- **Sobre o `sdd.md` e a branch:** hoje o `sdd` faz `git checkout staging` + `git pull` e diz que `.specs` é gitignored. Passa a fazer `git fetch origin` + `git switch -c <branch> origin/staging` (base atualizada equivale ao checkout+pull de antes e cria a branch no mesmo passo), preservando a regra de tree limpa e a exceção explícita do PO. O texto sobre "pasta gitignored, idêntica em qualquer branch" é removido.
- **Commits:** `Docs :bulb: [#217] ...` para a spec e ajustes de agentes/docs; `Chore :see_no_evil: [#217] ...` para o `.gitignore`; atômicos; changeset vazio (`npm run changeset -- --empty`) na última tarefa. Sem push nesta fase.
