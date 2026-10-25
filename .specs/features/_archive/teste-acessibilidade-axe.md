# teste-acessibilidade-axe

> Status: `implementada`
> Encerrada em: `2026-10-13`
> Commits: `464c23a..8f0b1e2` · PR: [#78](https://github.com/felipe-sant/portfolio-frontend/pull/78) · Issue: [#50](https://github.com/felipe-sant/portfolio-frontend/issues/50)

## O que foi pedido

A checklist de acessibilidade tem itens verificados pela forma `[axe]`, mas o helper de teste citado no método de verificação não existia. Sem ele, ARIA inválido, nome ausente e problemas de landmark e heading passavam batido.

## O que foi feito

Adicionou `axe-core` como devDependency (sem `vitest-axe` nem `jest-axe`) e o helper `src/testUtils/expectNoAxeViolations.ts`, uma função comum que roda `axe.run` no `container` renderizado e rejeita com `id` e alvo de cada violação. A regra `color-contrast` ficou desligada porque o `jsdom` não calcula cor. O helper tem teste próprio e é chamado nos testes de `Home`, `NotFound`, `Error` e `MainLayout`.

## Notas

O contraste fica para o teste no navegador real (#55). O `it` que chama o helper recebe 15000 ms de timeout, porque o `axe.run` é lento no `jsdom` com a suíte em paralelo.
