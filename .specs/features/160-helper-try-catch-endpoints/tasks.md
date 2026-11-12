# Tasks: Helper do try/catch dos endpoints de conteúdo

> Spec: `./spec.md`

## Plano de execução

```
T0 (sequencial) → T1 → T2 → T3 → T4 → T5
```

## Tarefas

- [ ] T0 — Conferir a dependência e rebasear
    - **Arquivo(s):** nenhum
    - **Depende de:** PR #260 mergeado
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `gh pr view 260 --json state --jq .state` retorna `MERGED`; `git fetch origin && git rebase origin/staging` sem conflito; `npm ci`
    - **Feito quando:** #260 está `MERGED`, a branch está rebaseada e `npm run typecheck && npm test -- --run --maxWorkers=2 src/store/api` passa antes de qualquer edição. Se o #260 não estiver mergeado, parar e avisar.
    - **Evidência:**

- [ ] T1 — Helper `runQueryFn`
    - **Arquivo(s):** `src/utils/runQueryFn.ts`, `src/utils/test/runQueryFn.test.ts`
    - **Depende de:** T0
    - **Testes (escritos antes, RED):** em `src/utils/test/runQueryFn.test.ts`
        - função que lança `ContentException` devolve `{ error }` com o `contentError` (critério 3)
        - função que lança `Error` comum devolve `{ error: { status: "FETCH_ERROR", error: message } }` (critério 3)
        - função que lança valor não-`Error` (string) devolve `FETCH_ERROR` com `String(valor)` (critério 3)
        - função que resolve devolve `{ data }` (critério 2)
        - função que resolve `undefined` devolve `{ data: undefined }` (critério 2)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/utils/test/runQueryFn.test.ts`
    - **Feito quando:** o gate passa e o arquivo tem um único `export default`, sem `any` nem cast.
    - **Evidência:**

- [ ] T2 — Usar o helper em `projects.api.ts`
    - **Arquivo(s):** `src/store/api/projects.api.ts`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica (refactor puro; a rede é `src/store/api/test/projects.api.test.tsx` existente, que deve continuar verde sem edição de asserção, incluindo `getProjectsPages`)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/store/api/test/projects.api.test.tsx`
    - **Feito quando:** os 6 `queryFn` usam `runQueryFn`, o arquivo não tem `try`/`catch` nem importa `toQueryError`, e o gate passa.
    - **Evidência:**

- [ ] T3 — Usar o helper em `profile.api.ts`, `timeline.api.ts` e `contact.api.ts`
    - **Arquivo(s):** `src/store/api/profile.api.ts`, `src/store/api/timeline.api.ts`, `src/store/api/contact.api.ts`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica (refactor puro; rede: `profile`, `timeline` e `contact` `.api.test.tsx` existentes)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/store/api`; `grep -rn "toQueryError\|catch" src/store/api/*.api.ts` sem resultado
    - **Feito quando:** os 4 `queryFn` usam o helper, o grep não encontra nada e o gate passa.
    - **Evidência:**

- [ ] T4 — Conferir docs e `.claude/CLAUDE.md`
    - **Arquivo(s):** `docs/architecture/frontend.md` (parágrafo dos endpoints de conteúdo, linha do `toQueryError`), outros docs que citem o padrão (`grep -rn "toQueryError" docs .claude`), `.claude/CLAUDE.md` só se citar o padrão (hoje não cita)
    - **Depende de:** T2, T3
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run lint` e, se houver teste de docs, `npm test -- --run --maxWorkers=2 scripts`
    - **Feito quando:** `frontend.md` cita `runQueryFn` (o `queryFn` envolve o corpo no helper, que converte o erro via `toQueryError`, e some com o `queryFn` na #43) sem apagar o texto que o #260 acrescentou; o `CLAUDE.md` segue sem mudança ou foi ajustado só se necessário.
    - **Evidência:**

- [ ] T5 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** T0 a T4
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run test:cov -- --maxWorkers=2` (única rodada pesada; conferir `uptime` antes)
    - **Feito quando:** o gate passa.
    - **Evidência:**
