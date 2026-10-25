# Tasks: <nome-da-feature-ou-bug>

> Spec: `./spec.md`

## Plano de execução (opcional)

Use esta seção apenas quando houver várias tarefas com dependência entre si.
Esboce as fases e marque com `[P]` as tarefas de uma mesma fase que são
independentes entre si (não editam o mesmo arquivo, uma não depende do
resultado da outra) — o `executor` pode disparar essas em paralelo, uma
sub-agent por tarefa:

```
Fase 1 (sequencial)  →  Fase 2 (T2 [P] e T3 [P] em paralelo)  →  Fase 3
      T1                        T2 [P]    T3 [P]                    T4
```

## Tarefas

- [ ] T1 — <descrição objetiva da tarefa>
    - **Arquivo(s):** `src/...`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):** lista de comportamentos a provar, um por linha, cada um com o ID do requisito (`RF-*`, `A11Y-*`, `NF-*` ou critério da spec) e o arquivo de teste (ex.: `src/pages/test/Home.page.test.tsx`); borda primeiro. Tarefa sem mudança de comportamento: `não se aplica`
    - **Gate:** comando que decide a tarefa (ex.: `npm run typecheck && npm run lint && npm test -- --run src/pages/test/Home.page.test.tsx`)
    - **Feito quando:** critério objetivo e verificável (ex.: o gate passa e a tabela de adequação cobre cada teste listado)
    - **Evidência:** (preenchida pelo `executor`: tabela de adequação com `arquivo:linha` e veredito)

- [ ] T2 [P] — <descrição objetiva da tarefa>
    - **Arquivo(s):** `src/...`
    - **Depende de:** T1 <!-- remova esta linha se não houver dependência -->
    - **Testes (escritos antes, RED):** ...
    - **Gate:** ...
    - **Feito quando:** critério objetivo e verificável
    - **Evidência:** ...

<!-- `[P]` no título marca a tarefa como paralelizável com outras `[P]` da mesma fase (ver "Plano de execução"). Omita o marcador se a tarefa for sequencial. -->

<!--
Cada tarefa deve ser pequena o suficiente para o executor marcar como concluída
sem ambiguidade.

Sobre testes (TDD, skill `tdd-patterns`): o executor escreve cada teste antes do
código, um por vez (vermelho, verde, refatora). Por isso toda tarefa que muda
comportamento lista "Testes" e "Gate". Spec de bug: a primeira tarefa é o teste
que reproduz o bug.

O repositório tem suíte utilizável (Vitest + jsdom; one-shot em
`npm test -- --run`). A convenção é teste em `test/` por diretório
(`<diretório>/test/<arquivo>.test.tsx` em `src/`, nunca `__tests__/`
nem `.spec.tsx`), e o "Feito quando" de toda tarefa que muda comportamento de
componente/hook/rota deve referenciar o arquivo de teste que cobre o cenário.

Tarefas que não mudam comportamento de código (documentação, config, criar
`.env.example`, etc.) nunca exigem teste — o "Feito quando" pode ser: o
build/lint passa, ou o arquivo/config está no estado esperado.
-->
