# Spec: Cabeçalho e título da Início sem vazamento com o espaçamento de texto

> **Tipo:** `bug` <br />
> **Status:** `em-revisao` <br />
> **Issue:** `#264` e `#265` (mesmo PR; relacionadas à `#41`, sem fechá-la) <br />
> **Criado em:** `12-11-2026`

## Problema

No pré-check da #41, com o espaçamento de texto da WCAG 1.4.12 aplicado (entrelinha 1,5, espaçamento entre letras 0,12em, entre palavras 0,16em e de parágrafo 2em), a página ganha rolagem horizontal em dois pontos. Reproduzido no navegador em 12-11-2026:

| Ponto                          | Idioma | Excesso sobre a largura da tela |
| ------------------------------ | ------ | ------------------------------- |
| Cabeçalho a 768 px (#264)      | pt-BR  | 4 px                            |
| Cabeçalho a 768 px (#264)      | es     | 24 px                           |
| Cabeçalho a 768 px (#264)      | en     | 0 (cabe)                        |
| `h1` da Início a 360 px (#265) | pt-BR  | 9 px                            |
| `h1` da Início a 360 px (#265) | en, es | 0 (cabe)                        |

Sem o espaçamento aumentado nada vaza. Quem usa esse ajuste de leitura perde parte do menu (768 px) ou precisa rolar na horizontal (360 px). Causa: o menu em linha (`header.module.css`, a partir de 720 px) e o título (`home.module.css`, `.heading`) não têm folga quando o texto fica mais largo.

## Objetivo

Com o espaçamento de texto da WCAG 1.4.12 aplicado, nada corta nem vaza: o cabeçalho a 768 px (pt-BR, en e es) e o `h1` da Início a 360 px (pt-BR, en e es) ficam dentro da largura da tela, sem rolagem horizontal, e sem mudança visual com o espaçamento normal.

## Fora de escopo

- Outras telas e outros pontos de largura (a #41 cobre a varredura completa).
- Mudar o ponto de troca entre menu em linha e menu do celular (720 px): mudaria o visual sem o ajuste.
- Mudar texto de tradução.

## Abordagem proposta (CSS; não entra em TDD)

- **Cabeçalho (#264):** deixar a barra e o menu em linha quebrarem para uma segunda linha quando faltar espaço (`flex-wrap`, com altura mínima em vez de fixa), em vez de forçar uma linha única. Sem o espaçamento aumentado, tudo cabe numa linha e o visual não muda. Nenhum item some nem é cortado.
- **Título (#265):** permitir a quebra da palavra mais longa do `h1` só quando ela não couber (`overflow-wrap`), sem mexer no tamanho nem no espaçamento normal.
- A abordagem exata é decidida pelo executor, medindo no navegador; se exigir mudar o visual normal, volta para revisão da spec.

## Critérios de aceite

- [ ] Com o espaçamento de texto da WCAG 1.4.12, o cabeçalho a 768 px não passa da largura da tela em pt-BR, en e es, nos dois temas, e nenhum item fica cortado ou escondido.
- [ ] Com o mesmo espaçamento, o `h1` da Início a 360 px cabe em pt-BR, en e es, nos dois temas, sem rolagem horizontal; também cabe com zoom de 200%.
- [ ] Sem o espaçamento aumentado, o visual do cabeçalho e do título é igual ao atual (nas larguras 360, 390, 768 e 1280 px).
- [ ] Um E2E novo (`e2e/text-spacing.spec.ts`, ID do requisito de 1.4.12 no título) aplica o espaçamento e confirma largura x idioma; o axe segue sem violações.
- [ ] Nenhum comentário no código.

## Estratégia de validação

- **Reprodução primeiro:** o E2E falha antes do CSS (4, 24 e 9 px) e passa depois.
- **Checagens automatizadas:** `npm run typecheck`, `npm run lint`, testes de unidade afetados (`--maxWorkers=2`); build e E2E no CI do PR.
- **Checagens manuais:** conferir no navegador, nos dois temas, 360, 768 e 1280 px sem o espaçamento (nada muda) e com ele (nada vaza).
- **Rollback / mitigação:** reverter o commit de CSS.

## Notas / decisões

- Entrega única para #264 e #265 porque ambas são CSS de layout da mesma verificação; o PR diz "Relacionada à #41" e fecha só #264 e #265.
