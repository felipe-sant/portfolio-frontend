# publicacao-fatec-token

> Status: `implementada`
> Encerrada em: `2026-11-04`
> Commits: `fbd61f2..1cc12a6` · PR: `#109` · Issue: `#63`

## O que foi pedido

Publicar o build da v1 no repositório da Fatec, onde o Pages em modo `legacy` serve `main:/docs`, a partir deste repositório e com um token do PO, já que ele não é admin de lá.

## O que foi feito

O `fatec-pages.yml` ganhou o job `publish`, que só roda para tag `v1.x.y`, confere que a tag está na `main` deste repositório, baixa o artefato `fatec-pages`, troca o `docs/` do destino por inteiro e faz commit e push em `main` como `github-actions[bot]`, sem `--force`. A troca fica em `scripts/replaceFatecDocs.ts` (`npm run publish:fatec:docs`), testada em diretórios temporários, para a única lógica que apaga dado não depender só do run real. O workflow é chamável por `workflow_call` (contrato com a #47) e por `workflow_dispatch`; o segredo é `FATEC_PAGES_TOKEN` e o `concurrency` não cancela. Dois ciclos do reviewer acrescentaram checkout na tag com `persist-credentials: false`, varredura de blocos `run` multilinha no teste e validação do clone de destino. Documentação, token e plano B manual em `docs/setup/environments.md`.

A publicação real da `v1.0.0` funcionou (commit 6ff65c9 na `main` da Fatec) e `/pt-BR` e `/en` responderam 200.

## Notas

- O token usado foi um PAT classic com escopo `repo`: a organização não listou o repositório no fine-grained. Expiração curta e revogação após a entrega.
- O primeiro deploy do Pages travou e só voltou com um commit vazio (46207a4), feito por nós; se acontecer de novo, esse é o caminho.
- O gatilho automático `release: published` fica como evolução da #47.
