# alinha-contributing-claude-readme

> Status: `implementada`
> Encerrada em: `2026-11-09`
> Commits: `docs/152-alinha-contributing-claude-readme` · PR: `—` · Issue: `https://github.com/felipe-sant/portfolio-frontend/issues/152`

## O que foi pedido

Acabar com as contradições entre `CONTRIBUTING.md`, `.claude/CLAUDE.md` e README sobre o fluxo de issue, branch, commit, PR e changeset, e fazer o CHANGELOG linkar PR e commit (achados IA-05 e D-08 da revisão de 08/11/2026).

## O que foi feito

- `CONTRIBUTING.md` reescrito como fonte para humanos: Projeto Portfolio (Status, Marco, Tipo, "blocked by"), labels só de área, issue fecha no merge para a `staging` (o PR de promoção não repete `Closes`), seção de changeset, verificação antes do PR e a política de IA com o item "Revisão humana feita" do template.
- `CLAUDE.md` manteve a seção "Padrão de branches, commits e PRs" (os agentes a citam pelo nome) como resumo operacional com link para o CONTRIBUTING; prosa explicativa saiu. `scripts/test/contributingTypesTable.test.ts` mantém a tabela de tipos igual nos dois arquivos.
- `executor.md` passou a pedir as labels de área no PR; `reviewer.md`, `sdd.md` e as skills já eram consistentes.
- Como a #148 moveu a referência do README para `docs/architecture/code-structure.md`, esse arquivo e a linha final do README agora apontam o CONTRIBUTING para o fluxo e o CLAUDE.md para código e agentes; `.changeset/README.md` não diz mais "até a v1".
- `@changesets/changelog-github` adotado (devDependency, `repo` `felipe-sant/portfolio-frontend`), com teste da config. Checagem de dependência da spec: sem aviso de segurança, sem depreciação, mantido pelo mesmo repositório do `@changesets/cli`, só roda em Node. Validado com um changeset tipado descartável: a linha gerada traz link de PR, de commit e o autor. `changeset version` fora do CI precisa de `GITHUB_TOKEN` (documentado em `docs/setup/environments.md` e no CONTRIBUTING).

## Notas

O histórico do CHANGELOG não foi reescrito. O ruleset exige só Test, Build, Lint e E2E; nenhum texto do repositório descrevia contextos de shard, então nada precisou mudar. O comando `check:contact-form` fica com a #158.
