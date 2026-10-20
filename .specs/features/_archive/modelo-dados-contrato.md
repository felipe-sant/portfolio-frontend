# modelo-dados-contrato

> Status: `implementada`
> Encerrada em: `2026-10-12`
> Commits: `9c3c144..28a8bbe` · PR: [#67](https://github.com/felipe-sant/portfolio-frontend/pull/67) e [#71](https://github.com/felipe-sant/portfolio-frontend/pull/71) · Issue: [#10](https://github.com/felipe-sant/portfolio-frontend/issues/10)

## O que foi pedido

As cinco telas e o layout já estavam documentados, e cada documento terminava com uma lista "O que a tela pede ao contrato", mas sem decisão final de campos, arquivos e endpoints. Sem ela, a camada de dados local e todo o M2 e as telas do M5 não podiam começar.

## O que foi feito

Criou `docs/architecture/data-model.md` (entidades, campos, tipos, obrigatoriedade, tradução, validação e origem nas decisões, mais a matriz tela, dado exibido e entidade.campo) e `docs/architecture/api-contract.md` (contrato esperado da API e a camada local da v1 que o simula), com a estratégia de tradução do conteúdo dinâmico. O PR #71 ajustou caixa, idioma e URL dos documentos do projeto (commits `84aa48d..ac0d2c4`).

## Notas

O PR #67 teve 28 commits; o PR #71 (ajuste dos documentos) teve 5. D51 a D55 revisaram partes do contrato depois (lista de projetos pela API, CV como arquivo próprio, trajetória pela API, documentos livres).
