# requisitos-inicio

> Status: `implementada`
> Encerrada em: `2026-10-12`
> Commits: `7562ba0..37fc08f` · PR: [#27](https://github.com/felipe-sant/portfolio-frontend/pull/27) · Issue: [#3](https://github.com/felipe-sant/portfolio-frontend/issues/3)

## O que foi pedido

A tela Início é a primeira impressão e o fim da jornada do recrutador ("Baixar CV"), mas o comportamento estava espalhado entre decisões, acessibilidade, requisitos não funcionais, glossário e protótipo, e a issue da tela não tinha documento para cobrir por teste.

## O que foi feito

Criou `docs/screens/home.md`, com as seis seções do molde mais Textos fixos e chaves, Conteúdo e contrato de dados, Metadados e dados estruturados e Critérios de aceite, com IDs `RF-HOME-nn`. A spec listou onde o corpo da issue e o protótipo foram superados pelas decisões (título sem ponto final, "Trabalhando como", até quatro destaques, quebra em 640px por media query, um link por card, faixa de stack acessível com botão de pausa, depoimentos fora do produto).

## Notas

O handoff não estava acessível na máquina; as citações dele vieram da issue, do glossário e do `design-system.md`.
