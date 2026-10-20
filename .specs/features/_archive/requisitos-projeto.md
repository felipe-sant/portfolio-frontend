# requisitos-projeto

> Status: `implementada`
> Encerrada em: `2026-10-12`
> Commits: `5450225..93213ba` · PR: [#29](https://github.com/felipe-sant/portfolio-frontend/pull/29) · Issue: [#5](https://github.com/felipe-sant/portfolio-frontend/issues/5)

## O que foi pedido

A tela `/projects/:id` é a mais complexa do produto (galeria, lightbox, documentação em markdown, ficha técnica, links e relacionados) e o comportamento estava espalhado entre decisões, acessibilidade, requisitos não funcionais e o protótipo.

## O que foi feito

Criou `docs/screens/project.md`, com IDs `RF-PROJECT-nn`, cobrindo cabeçalho, galeria e lightbox, ficha técnica, links, documentos em rotas filhas, renderização do markdown (GFM com tabela, sem HTML embutido), relacionados, estados, metadados, JSON-LD e pré-renderização. O padrão de documentos do PO (comentário de 11/10/2026 na issue) virou D33. O `:id` é UUID v7 e id inexistente cai na página não encontrada.

## Notas

Depois, D55 trocou os quatro documentos fixos por uma lista livre de documentos por projeto.
