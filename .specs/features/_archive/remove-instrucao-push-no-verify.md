# remove-instrucao-push-no-verify

> Status: `implementada`
> Encerrada em: `2026-11-08`
> Commits: `c25f144..HEAD` · PR: `—` · Issue: `#151`

## O que foi pedido

Remover do `.claude/CLAUDE.md` e do agente `executor` a instrução de usar `git push --no-verify`, que não muda nada (não existe hook de pre-push) mas soa como pular verificação.

## O que foi feito

O parágrafo do `CLAUDE.md` e o bullet do `executor.md` foram removidos por inteiro, por decisão do PO. A varredura em `.claude/agents` e `.claude/skills` não achou outra repetição, e a regra de push só no fim do fluxo, em "Tooling de IA", e a seção "Verificação" do `executor` ficaram intactas. O PR leva changeset vazio.

## Notas

A #152 também edita a seção de PRs do `CLAUDE.md`: se houver conflito de merge, a remoção desta issue prevalece.
