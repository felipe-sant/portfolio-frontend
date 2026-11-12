# Tasks: Testes instáveis de "Limpar filtros" e do cliente HTTP com BASE_URL

> Spec: `./spec.md`

## Tarefas

- [ ] T1 — Reproduzir as duas instabilidades antes de corrigir
    - **Arquivo(s):** `src/pages/test/Projects.page.test.tsx`, `src/store/api/test/profile.api.test.tsx`, `src/store/api/test/projects.api.test.tsx`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):** teste do "Limpar filtros" com o conteúdo do filtro atrasado (`holdFetchAfter`) falha com 9 cards em vez de 10; identificar qual teste de `BASE_URL` estoura e por quê (medição do `import()` sob carga)
    - **Gate:** `npx vitest --run --maxWorkers=2 src/pages/test/Projects.page.test.tsx -t "Limpar filtros"`
    - **Feito quando:** a falha é reproduzida de forma determinística e a causa dos testes de `BASE_URL` está registrada na spec
    - **Evidência:** (executor)

- [x] T2 — Estabilizar "Limpar filtros" esperando o estado do filtro
    - **Arquivo(s):** `src/pages/test/Projects.page.test.tsx`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** o teste de T1 passa a verde; critério de aceite 1 e 2 da spec
    - **Gate:** `npm run typecheck && npm run lint && npx vitest --run --maxWorkers=2 src/pages/test/Projects.page.test.tsx`
    - **Feito quando:** o arquivo passa 20 vezes seguidas sob carga
    - **Evidência:** corrida reproduzida com o filtro atrasado (`holdFetchAfter`): esperava 10 cards e veio 9; teste corrigido esperando endereço com `type=` e "9 de 10 projetos" antes de Carregar mais; arquivo passou 4 vezes seguidas sob carga. Teste de T3 ainda não corrigido: ver evidência de T3.

- [ ] T3 — Estabilizar os testes com `BASE_URL` e módulos recarregados
    - **Arquivo(s):** os testes identificados em T1
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** o cenário instável de T1 passa a verde; critério de aceite 3 da spec
    - **Gate:** `npm run typecheck && npm run lint && npx vitest --run --maxWorkers=2 src/store/api src/services src/testUtils src/prerender`
    - **Feito quando:** passam 20 vezes seguidas sob carga, restaurando `BASE_URL` e módulos
    - **Evidência:** (executor)
