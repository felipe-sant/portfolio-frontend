# estabiliza-teste-project-document-section

> Status: `resolvida`
> Encerrada em: `2026-11-08`
> Commits: `6bfbba0..HEAD` · PR: `—` · Issue: `#161`

## O que foi pedido

Um teste de `ProjectDocumentSection` estourou o timeout na primeira execução completa da suíte e passou isolado: o import dinâmico do renderer de markdown acontecia dentro do tempo do primeiro teste que o usava.

## O que foi feito

- `ProjectDocumentSection.test.tsx` pré-carrega o renderer real em `beforeAll`; os timeouts de 10 s e 15 s dos testes markdown saíram, e o teste de axe, de quatro cenários, virou quatro `it`. Medição a frio: só o primeiro teste markdown pagava o import (621 ms), os seguintes levavam 10 a 30 ms. Os demais testes de markdown seguem com o renderer real já carregado (a rolagem por `useScrollToHash` depende do DOM do `rehype-slug`), sem mock.
- Decisão do PO que ampliou a spec: `testTimeout` e `hookTimeout` globais de 30 s em `vite.config.ts`, e todos os timeouts por teste (`15000`, `20000`, `40000` no terceiro argumento do `it` ou em `describe`) foram removidos; `relaxTimeoutsForLoad` passou a 30 s. `CLAUDE.md` e a skill `vitest-specialist` deixaram de pedir `15000` no `it` do axe.
- Playwright: `retries` do CI de 2 para 1 e `failOnFlakyTests` ligado no CI (suportado na 1.64), para que teste que só passou na retry falhe o job. A skill `playwright-e2e` foi ajustada.
- Prova de discriminação: trocar o `lazy(loadMarkdownRenderer)` por um componente vazio fez o teste de integração e os de âncora falharem; desfeito.
- Suíte inteira passou 3 vezes seguidas e uma quarta com `--maxWorkers=1` e quatro processos ocupando CPU (368 s).

## Notas

- O `SkipLink.test.tsx` perdeu o `15000` pelo mesmo motivo (global de 30 s); não houve medição separada.
- Os `timeout` de `findBy`/`waitFor` (5000, 10000) em outros arquivos ficaram como estavam.
- Na primeira execução completa depois da mudança, `Main.layout.test.tsx` (axe) falhou uma vez e não voltou a falhar em 5 execuções seguintes; a causa não foi capturada.
