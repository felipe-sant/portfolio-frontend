# Tasks: reserva de espaço na tela Contato para o layout não pular no celular

> Spec: `./spec.md`

## Plano de execução

```
Fase 1 (T1 [P] e T2 [P])  →  Fase 2 (T3)  →  Fase 3 (T4)
```

Pré-requisito: o PO responde as questões em aberto 1 a 3 da spec; mudou a resposta, a spec volta para ajuste antes do `executor`.

## Tarefas

- [x] T1 [P] — Teste vermelho do deslocamento (E2E de Contato com fonte atrasada)
    - **Arquivo(s):** `e2e/contact.spec.ts`, `e2e/support/specClassification.ts` (só se o arquivo mudar de lista)
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - em 393×851, com os `woff2` de `/fonts/` respondidos só depois de a página montar (`page.route` com espera por estado, nunca por tempo fixo), o CLS acumulado de `/pt-BR/contact` fica abaixo de 0,1 (NF-DE-02), nos três idiomas, em `e2e/contact.spec.ts`; fica vermelho no código atual (0,1012 em `pt-BR` e `es`)
    - **Gate:** `npm run typecheck && npm run lint` e o caso vermelho confirmado localmente num build `build:fatec` em porta própria (um build por vez); o E2E completo roda no CI
    - **Feito quando:** o caso existe, falha no código atual pelo motivo certo (deslocamento da linha de ações) e está classificado em `specClassification.ts`
    - **Evidência:** (executor)

- [x] T2 [P] — Teste vermelho da reserva por peso
    - **Arquivo(s):** `scripts/test/fontWeights.test.ts`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - todo peso de IBM Plex Sans declarado em `@font-face` tem um `@font-face` de reserva com `size-adjust` (CA3) em `scripts/test/fontWeights.test.ts`
        - `--font-body` lista a reserva depois de "IBM Plex Sans" e antes de `system-ui` (CA3), mesmo arquivo
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 scripts/test/fontWeights.test.ts` (vermelho no estado atual)
    - **Feito quando:** os dois testes existem e falham pelo motivo certo
    - **Evidência:** (executor)

- [x] T3 — Fonte reserva com métricas ajustadas
    - **Arquivo(s):** `src/styles/global.css`
    - **Depende de:** T1, T2
    - **Testes (escritos antes, RED):** os de T1 e T2 passam a verdes (CA2, CA3); a aparência é CSS e não entra em TDD
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 scripts/test/fontWeights.test.ts`; depois, `npm run build:fatec` e a medição da "Estratégia de validação" (3 rodadas por idioma, mais as outras rotas), um build por vez, em porta própria
    - **Feito quando:** o gate passa; CLS ≤ 0,02 nas três rotas de Contato e igual ou menor nas outras; tabela antes e depois pronta para o PR; captura carregada igual à da `staging`
    - **Evidência:** (executor)

- [x] T4 — Documentação e verificação completa
    - **Arquivo(s):** `docs/setup/e2e-performance.md` (ou `docs/design/design-system.md`)
    - **Depende de:** T3
    - **Testes (escritos antes, RED):** não se aplica (documentação)
    - **Gate:** `npm run lint`; o `test:cov` e o E2E completo no CI do PR. Depois, `npm run changeset` (`patch`)
    - **Feito quando:** o gate passa e a doc descreve a reserva, a medida dos ajustes e o procedimento de CLS
    - **Evidência:** (executor)

## Verificação manual (fora do TDD)

- Depois do deploy no Pages, a #41 repete o Lighthouse mobile de `/pt-BR/contact`, `/en/contact` e `/es/contact` e confere CLS ≤ 0,1; este PR não fecha a #41.
