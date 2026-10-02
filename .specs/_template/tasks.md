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
    - **Feito quando:** critério objetivo e verificável (ex.: `npm test` passa cobrindo o cenário X em `src/pages/test/Home.page.test.tsx`)

- [ ] T2 [P] — <descrição objetiva da tarefa>
    - **Arquivo(s):** `src/...`
    - **Depende de:** T1 <!-- remova esta linha se não houver dependência -->
    - **Feito quando:** critério objetivo e verificável

<!-- `[P]` no título marca a tarefa como paralelizável com outras `[P]` da mesma fase (ver "Plano de execução"). Omita o marcador se a tarefa for sequencial. -->

<!--
Cada tarefa deve ser pequena o suficiente para o executor marcar como concluída
sem ambiguidade.

Sobre testes: o repositório tem suíte utilizável (Vitest + jsdom; one-shot em
`npm test -- --run`). A convenção é teste em `test/` por diretório
(`<diretório>/test/<arquivo>.test.tsx` em `src/`, nunca `__tests__/`
nem `.spec.tsx`), e o "Feito quando" de toda tarefa que muda comportamento de
componente/hook/rota deve referenciar o arquivo de teste que cobre o cenário.

Tarefas que não mudam comportamento de código (documentação, config, criar
`.env.example`, etc.) nunca exigem teste — o "Feito quando" pode ser: o
build/lint passa, ou o arquivo/config está no estado esperado.
-->
