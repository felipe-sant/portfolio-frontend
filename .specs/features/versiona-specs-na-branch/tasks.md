# Tasks: versiona-specs-na-branch

> Spec: `./spec.md`

Chore de documentação e configuração: nenhuma tarefa muda comportamento de código, então "Testes" é `não se aplica` (sem teste de unidade novo) e a verificação é por comando. Nenhum comentário em código ou arquivo de configuração novo. Rode só o gate de cada tarefa; a suíte completa fica na T8.

## Plano de execução

```
Fase 1 (sequencial)  →  Fase 2 (T2 [P] T3 [P] T4 [P] T5 [P] T6 [P])  →  Fase 3
      T1                                                                  T7, T8
```

## Tarefas

- [x] T1 — Bootstrap: remover do `.gitignore` as regras de `.specs` e commitar a própria spec
    - **Arquivo(s):** `.gitignore`, `.specs/features/versiona-specs-na-branch/spec.md`, `.specs/features/versiona-specs-na-branch/tasks.md`
    - **Depende de:** nenhuma (a branch `chore/217-versiona-specs-na-branch` já existe; apenas confirmar com `git branch --show-current`)
    - **Testes (escritos antes, RED):** não se aplica (sem lógica). Verificação objetiva do CA3 abaixo.
    - **Gate:** `git check-ignore .specs/features/x/spec.md .specs/bugs/x/spec.md` sai vazio; `grep -n "specs" .gitignore` sai vazio; `git status --short .specs` lista a pasta desta spec como nova
    - **Feito quando:** o gate passa e há um commit `Chore :see_no_evil: [#217] Versiona as especificações junto da branch` com o `.gitignore` e a pasta desta spec (a spec entra neste commit, que é o bootstrap); as quatro linhas (`.specs/bugs/*/`, `.specs/features/*/` e as duas exceções `_archive`) saíram
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T2 [P] — `sdd.md`: criar a branch da feature, commitar a spec e ajustar o escopo do Bash
    - **Arquivo(s):** `.claude/agents/sdd.md`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica. Verificação do CA1.
    - **Gate:** `grep -n "gitignored" .claude/agents/sdd.md` sai vazio; `grep -n "git switch -c" .claude/agents/sdd.md` acha a criação a partir de `origin/staging`; `grep -nE "git (fetch|switch|add|commit)" .claude/agents/sdd.md` acha as permissões; `npm run lint`
    - **Feito quando:** o texto (a) troca o passo "checkout staging + pull" por `git fetch origin` e `git switch -c <tipo>/<issue>-<descrição> origin/staging` (mantendo parar em árvore suja, mudar para a branch quando ela já existe e a exceção de branch pedida pelo PO), (b) manda commitar `spec.md` e `tasks.md` na branch com `git add .specs/...` explícito e commit `Docs :bulb: [#issue] ...` no formato do `CLAUDE.md`, (c) amplia o `Bash` para `git fetch`, `git switch`, `git add` e `git commit` só de arquivos em `.specs/` e continua proibindo editar código, build e testes, (d) remove a frase de que `.specs` é gitignored; fica dito que o `sdd` não faz push nem abre PR
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T3 [P] — `executor.md`: só mudar para a branch da spec e remover o resumo de arquivamento
    - **Arquivo(s):** `.claude/agents/executor.md`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica. Verificação dos CA2, CA4 e CA5.
    - **Gate:** `grep -nE "switch -c|_archive|gitignored|planejamento local" .claude/agents/executor.md` sai vazio; `npm run lint`
    - **Feito quando:** a linha 10 diz que o `executor` muda para a branch da spec (`git switch <branch>`, a que o `sdd` criou) e, se ela não existir, para e avisa em vez de criar; a linha 65 deixa de exigir resumo e a regra "nunca commite as pastas de spec" sai, e no lugar entra o fechamento aprovado em Questões em aberto 1 (ao chegar em `implementada`, `git rm -r` da pasta da spec em commit `Docs` próprio, antes do PR); o parágrafo sobre o `**Status:**` `implementada` continua
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T4 [P] — `reviewer.md`: deixar de bloquear spec commitada
    - **Arquivo(s):** `.claude/agents/reviewer.md`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica. Verificação do CA4.
    - **Gate:** `grep -nE "planejamento local|não devem ser commitadas|_archive" .claude/agents/reviewer.md` sai vazio; `npm run lint`
    - **Feito quando:** a linha 37 foi removida (ou trocada por: spec commitada em `.specs/` na branch é esperada e não bloqueia; spec `implementada` ainda presente na árvore quando o PR é aberto é apontada conforme a decisão da Questão 1) e a linha 33 segue valendo
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T5 [P] — Documentação do fluxo: `.claude/CLAUDE.md`, `.claude/README.md`, `docs/README.md`
    - **Arquivo(s):** `.claude/CLAUDE.md` (bloco `.specs/` da seção "Tooling de IA", linhas 248-250), `.claude/README.md` (linhas 11, 42 e 63-65), `docs/README.md` (tabela "`docs/` vs `.specs/`", linhas 13-19)
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica. Verificação dos CA4, CA5 e CA6.
    - **Gate:** `grep -rnE "gitignored|planejamento local|só o resumo" .claude/CLAUDE.md .claude/README.md docs/README.md` sai vazio; `npm test -- --run scripts/test/contributingTypesTable.test.ts`; `npm run lint`
    - **Feito quando:** os três arquivos dizem que a spec nasce na branch da feature, criada pelo `sdd`, é versionada com ela e removida ao concluir (conforme Questão 1), sem passo de resumo; a linha "Versionada" de `docs/README.md` e a linha "Vida" ficam coerentes (spec versionada enquanto a feature está em andamento); o papel do `sdd` na tabela do README cita a criação da branch e o commit da spec; a tabela de tipos de `.claude/CLAUDE.md` não foi alterada (o teste prova)
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T6 [P] — Remover os modelos `_archive/_TEMPLATE.md` (decisão recomendada, Questão 2)
    - **Arquivo(s):** `.specs/features/_archive/_TEMPLATE.md`, `.specs/bugs/_archive/_TEMPLATE.md`
    - **Depende de:** T3 (o `executor.md` deixa de citar o modelo antes de ele sair)
    - **Testes (escritos antes, RED):** não se aplica. Verificação do CA3.
    - **Gate:** `ls .specs/features/_archive/_TEMPLATE.md .specs/bugs/_archive/_TEMPLATE.md` falha nos dois; `git diff --stat --diff-filter=M -- .specs/features/_archive .specs/bugs/_archive` sai vazio (nenhum resumo alterado); `grep -rn "_TEMPLATE" .claude docs CONTRIBUTING.md` não acha o modelo de arquivamento
    - **Feito quando:** só os dois `_TEMPLATE.md` foram removidos (`git rm`) e os 52 resumos seguem intactos; se o PO escolher "legado" em vez de remover, trocar por um aviso no topo de cada modelo e este "Feito quando" por esse critério
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T7 — Varredura final de menções e do commit
    - **Arquivo(s):** `.claude/`, `docs/`, `CONTRIBUTING.md`, `.gitignore`
    - **Depende de:** T2, T3, T4, T5, T6
    - **Testes (escritos antes, RED):** não se aplica.
    - **Gate:** `grep -rniE "gitignored|planejamento local|nunca commite as pastas|só o resumo" .claude docs CONTRIBUTING.md` sai vazio (ocorrências de `gitignored` sobre `dist-server/`, `coverage/` e `e2e-timings/` em `docs/setup/` são legítimas e ficam); `grep -rn "_archive" .claude docs` sai vazio ou cita só resumo legado como histórico; `git check-ignore .specs/features/x/spec.md` sai vazio
    - **Feito quando:** o gate passa e cada critério CA1 a CA5 tem a verificação correspondente registrada na "Evidência"; commits atômicos feitos (`Docs :bulb: [#217] ...` por área) e changeset vazio criado e commitado com `npm run changeset -- --empty`
    - **Evidência:** (preenchida pelo `executor`)

- [ ] T8 — Fechamento da feature: gate completo
    - **Arquivo(s):** nenhum
    - **Depende de:** T7
    - **Testes (escritos antes, RED):** não se aplica.
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run` (suíte completa, só aqui)
    - **Feito quando:** o gate passa; `**Status:**` do `spec.md` é `implementada` e, conforme Questão 1, a pasta da spec é removida em commit `Docs` próprio; sem push nem PR (o orquestrador decide)
    - **Evidência:** (preenchida pelo `executor`)
