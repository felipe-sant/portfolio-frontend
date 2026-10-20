# requisitos-informacoes

> Status: `implementada`
> Encerrada em: `2026-10-12`
> Commits: `5504f24..ef758d3` · PR: [#25](https://github.com/felipe-sant/portfolio-frontend/pull/25) · Issue: [#6](https://github.com/felipe-sant/portfolio-frontend/issues/6)

## O que foi pedido

A tela `/about` junta o que o recrutador procura antes de chamar alguém para conversar, mas o comportamento estava espalhado entre decisões, acessibilidade, requisitos não funcionais e o protótipo, e a issue da tela dependia de um documento que não existia.

## O que foi feito

Criou `docs/screens/about.md`, com IDs `RF-ABOUT-nn`, cobrindo apresentação (foto, localização, disponibilidade, "Baixar CV", "Entrar em contato"), sobre mim, stack agrupada, complementos, trajetória e modal de detalhe, mais estados, metadados e JSON-LD. A seção "O que a tela pede ao contrato" listou entidades e campos para a issue do modelo de dados. Foto real na v1 (D26), depoimentos fora do produto (D13) e período "MM/AAAA – MM/AAAA" ou "desde MM/AAAA" com selo "Atual".
