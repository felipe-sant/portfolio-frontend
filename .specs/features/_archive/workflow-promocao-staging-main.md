# workflow-promocao-staging-main

> Status: `implementada`
> Encerrada em: `2026-11-09`
> Commits: `origin/staging..chore/workflow-promocao-staging-main` · PR: `—` · Issue: `— (a criar: Tipo FEAT, label infra)`

## O que foi pedido

Automatizar o PR de promoção `staging` -> `main`, que era aberto à mão com a lista de issues escrita à mão.

## O que foi feito

Workflow `promote.yml` (push na `staging` e `workflow_dispatch`) que abre ou atualiza um único PR com título padrão e corpo gerado a partir do template, listando as issues (via `closingIssuesReferences`) e os PRs sem issue. A lógica ficou em `scripts/preparePromotion.ts` sobre três funções puras testadas (`parseMergedPullNumbers`, `hasPendingChangesets`, `buildPromotionBody`); o YAML só orquestra e é guardado por `promoteWorkflow.test.ts`. Sem diferença entre as branches não cria PR; com changeset pendente em `.changeset/` termina verde, escreve o motivo no resumo e converte o PR aberto em draft, tirando-o de draft quando a versão é aplicada. Nunca faz merge nem aprovação. Documentado em `environments.md`, `CONTRIBUTING.md` e `CLAUDE.md`.

## Notas

Falta a conferência manual do PO depois do merge na `staging` (Actions > Promote > Run workflow). O merge da promoção deve ser sempre por commit de merge. A issue ainda precisa ser criada.
