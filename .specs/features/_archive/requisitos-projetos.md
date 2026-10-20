# requisitos-projetos

> Status: `implementada`
> Encerrada em: `2026-10-12`
> Commits: `1dadfb8..021d663` · PR: [#28](https://github.com/felipe-sant/portfolio-frontend/pull/28) · Issue: [#4](https://github.com/felipe-sant/portfolio-frontend/issues/4)

## O que foi pedido

A tela `/projects` é o passo do meio da jornada do cliente e a issue da tela exigia que cada regra do documento virasse teste, mas o documento não existia. O protótipo deixava sem resposta o escopo da busca, a regra de combinação dos filtros, o desempate da ordenação, o estado na URL e a volta do detalhe.

## O que foi feito

Criou `docs/screens/projects.md`, com IDs `RF-PROJECTS-nn`, cobrindo busca, filtros de tipo e categoria, ordenação, contagem, carregamento incremental em lotes de 9, card, estados (carregando, sem resultado, vazio, erro), estado na URL, volta do detalhe e troca de idioma. Sem modal de filtros e sem chips removíveis (D16); E entre busca, tipo e categoria; busca, tipo, categoria e ordenação na query, e a quantidade carregada só no histórico.
