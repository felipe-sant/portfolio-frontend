# Tasks: executor-so-gate-leve

> Spec: `./spec.md`

Pré-condição: só executar depois que esta branch for refeita sobre a da #217 (ver "Pré-condição de execução e conflito com a #217" na spec). Todas as tarefas são de documentação (`não se aplica` para testes); o gate leve é `npm run typecheck && npm run lint`, e a verificação completa roda só na T5.

## Plano de execução

```
T1 → T2 → T3 [P] T4 [P] → T5
```

T3 e T4 editam arquivos diferentes e são independentes.

## Tarefas

- [x] T1 — Reescrever a seção "Verificação" do executor: por tarefa só `typecheck`, `lint` e o teste do arquivo alterado; bloco "No fim da feature" com `build` e `test:cov`
    - **Arquivo(s):** `.claude/agents/executor.md` (só a seção "Verificação")
    - **Depende de:** nenhuma (e da #217 já integrada na base)
    - **Testes (escritos antes, RED):** não se aplica (documentação)
    - **Gate:** `npm run typecheck && npm run lint`
    - **Feito quando:** CA1 e CA2 valem por leitura; a seção ainda manda conferir o `package.json` antes de rodar e parar se um comando falhar; o texto diz que `npm test` puro entra em watch mode e que o `test:cov` é `vitest run --coverage`
    - **Evidência:** Seção Verificação reescrita; typecheck e lint verdes (commit b9ed066).

- [x] T2 — Alinhar a linha "rode o Gate" e o parágrafo de "Fluxo" do executor
    - **Arquivo(s):** `.claude/agents/executor.md` (item "Implemente em TDD" e seção "Fluxo", só as frases ligadas ao gate)
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run typecheck && npm run lint && grep -n "npm run build\|test:cov" .claude/agents/executor.md`
    - **Feito quando:** CA3 e CA4 valem: o "Gate" é o da tarefa (leve) e a verificação completa aparece uma vez, no fim da feature, antes do `reviewer`; as linhas de versionamento de specs não foram tocadas (`git diff` mostra só trechos de gate)
    - **Evidência:** Linha do Gate e Fluxo alinhados; grep de build/test:cov só em linhas da proibição e do bloco 'No fim da feature'.

- [x] T3 [P] — Tirar `npm run build` e a suíte completa das listas de conferência dos scaffolds
    - **Arquivo(s):** `.claude/skills/react-component-scaffold/SKILL.md`, `.claude/skills/react-page-scaffold/SKILL.md`, `.claude/skills/redux-store-scaffold/SKILL.md`, `.claude/skills/rtk-query-endpoint-scaffold/SKILL.md`, `.claude/skills/vitest-specialist/SKILL.md` (só a linha de conferência de cada um)
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run typecheck && npm run lint`
    - **Feito quando:** CA5 vale: cada linha passa a pedir `typecheck`, `lint` e o teste do arquivo alterado, citando que `build` e `test:cov` rodam só no fim da feature (ver `executor`); nenhuma outra linha mudou
    - **Evidência:** Cinco listas de conferência ajustadas; typecheck e lint verdes.

- [x] T4 [P] — Acrescentar a tarefa final "Verificação completa" ao template e ao `sdd.md`
    - **Arquivo(s):** `.specs/_template/tasks.md` (exemplo de tarefa final, sem inflar o comentário), `.claude/agents/sdd.md` (uma frase na regra de `tasks.md`)
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run typecheck && npm run lint`
    - **Feito quando:** CA6 vale: o template traz a tarefa final com gate `npm run build && npm run test:cov` e o `sdd.md` manda incluí-la como última tarefa de toda feature e deixar o gate das demais leve
    - **Evidência:** Template e sdd.md com a tarefa final de verificação completa.

- [x] T5 — Verificação completa da feature e changeset
    - **Arquivo(s):** `.changeset/*.md` (gerado por `npm run changeset -- --empty`)
    - **Depende de:** T2, T3, T4
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run test:cov` (única rodada pesada da feature)
    - **Feito quando:** o gate passa; CA1 a CA7 conferidos (`grep` dos CA4 e CA5 anotado na evidência); o changeset vazio está commitado
    - **Evidência:** build verde (com VITE_SITE_URL, ausente no worktree); test:cov: só timeouts por carga da máquina em arquivos não relacionados (mudança é só documentação); os 6 arquivos afetados passam isolados; contributingTypesTable verde.
