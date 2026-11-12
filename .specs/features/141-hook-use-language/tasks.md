# Tasks: Hook useLanguage

> Spec: `./spec.md`

## Plano de execução

```
T1 (rebase, após merge do #251) → T2 (hook, TDD) → T3 [P] páginas/hooks de página → T4 [P] hooks e componentes → T5 (docs) → T6 (verificação)
```

T3 e T4 editam arquivos distintos e podem correr em paralelo. Nenhum código tem comentários.

## Tarefas

- [x] T1 — Rebase em `origin/staging` com o PR #251 já mergeado
    - **Arquivo(s):** nenhum (git)
    - **Depende de:** merge do #251
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `git fetch origin && git rebase origin/staging && npm run typecheck`
    - **Feito quando:** a branch está sobre `origin/staging` com o #251 incluído e o typecheck passa
    - **Evidência:** `origin/staging` com o #251 mesclado (merge sem conflito); typecheck verde.

- [x] T2 — Criar `useLanguage` (TDD)
    - **Arquivo(s):** `src/hooks/useLanguage.ts`, `src/hooks/test/useLanguage.test.tsx`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):**
        - idioma resolvido ausente ou não suportado devolve `FALLBACK_LANGUAGE` (A2) — `src/hooks/test/useLanguage.test.tsx`
        - devolve o idioma ativo `pt-BR`/`en`/`es` (A1) — mesmo arquivo
        - `setLanguage("es")` dentro de `act` atualiza o valor sem remontar (A3) — mesmo arquivo
        - restaurar o idioma no `afterEach`, sem mock de `react-i18next`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/hooks/test/useLanguage.test.tsx`
    - **Feito quando:** o hook chama `useTranslation()` e devolve `getLanguage()`, `export default` no final, e o gate passa
    - **Evidência:** RED visto (hook inexistente), depois `useLanguage.test.tsx` com 5 testes verdes; typecheck e lint verdes.

- [x] T3 [P] — Trocar a expressão nas páginas e hooks de página
    - **Arquivo(s):** `src/pages/Project.page.tsx`, `src/pages/hooks/{useHome,useProjectDocument,useProject,useContact,useProjects,useAbout}.ts`
    - **Depende de:** T2
    - **Testes (escritos antes, RED):** não se aplica (sem mudança de comportamento; cobertos por `src/pages/test/*.test.tsx` e `src/pages/hooks/test/`)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages`
    - **Feito quando:** cada arquivo usa `const language = useLanguage()`, sem `i18n`, `resolveSupportedLanguage` ou `FALLBACK_LANGUAGE` sem uso, e sem `useTranslation` onde `t` não é usado; o gate passa
    - **Evidência:** seis hooks de página, `Project.page.tsx` e `useProjects.ts` usam `useLanguage()`; typecheck e lint verdes.

- [x] T4 [P] — Trocar a expressão em hooks e componentes
    - **Arquivo(s):** `src/hooks/{useShareImage,useLocalizedPath,useResume}.ts`, `src/components/{TrajectoryPeriod,StatusCard,PageMeta,LanguageSelector,Footer,ResumeModal}.tsx`
    - **Depende de:** T2
    - **Testes (escritos antes, RED):** não se aplica (cobertos por `src/hooks/test/` e `src/components/test/`, incluindo `useLocalizedPath.test.ts`, `useResume.test.tsx`, `useShareImage.test.tsx`)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/hooks src/components`
    - **Feito quando:** `LanguageSelector` e `Footer` (`lang`) usam o hook, `PageMeta` mantém `FALLBACK_LANGUAGE` só onde ainda é usado (`buildAbsoluteUrl`), e `grep -rn "resolveSupportedLanguage(i18n.resolvedLanguage)" src` só acha `src/i18n/getLanguage.ts` (fora de testes); o gate passa
    - **Evidência:** três hooks e seis componentes usam `useLanguage()`; `grep` só acha `src/i18n/getLanguage.ts` fora de testes; typecheck e lint verdes.

- [x] T5 — Atualizar documentação
    - **Arquivo(s):** `docs/architecture/frontend.md`
    - **Depende de:** T3, T4
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run lint`
    - **Feito quando:** a "API de idioma" cita `useLanguage()` (hook em `src/hooks/`) ao lado de `getLanguage()`, e o texto não promete mais que o componente lê `i18n.resolvedLanguage` direto
    - **Evidência:** a "API de idioma" de `docs/architecture/frontend.md` cita `useLanguage()` ao lado de `getLanguage()` e `setLanguage`.

- [x] T6 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** T1 a T5
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `uptime` (load abaixo de 14) e `npm run build && npm run test:cov -- --maxWorkers=2` (única rodada pesada; E2E roda no CI)
    - **Feito quando:** o gate passa
    - **Evidência:** PR #255 com todos os checks do CI verdes: Build, Lint, Test (com cobertura), Changeset, E2E scope, 4 shards de E2E e E2E agregado.
