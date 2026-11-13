# Spec: reserva de espaço na tela Contato para o layout não pular no celular

> **Tipo:** `bug` <br />
> **Status:** `em-andamento` <br />
> **Issue:** `#266` (relacionada à #41, sem fechá-la) <br />
> **Criado em:** `12-11-2026`

## Problema

No pré-check da #41 (falha F3), `/pt-BR/contact` no celular teve CLS de 0,105, acima da meta de 0,1 (`NF-DE-02`). As outras rotas medidas tiveram 0.

### Causa medida

Reproduzida em 12/11/2026 no `npm run build:fatec` da `staging` (`742fee8`), servido em `localhost:5178`, com Chromium em perfil Pixel 5 (393 px), rede 150 ms e 1,6 Mb/s e CPU 4x mais lenta, observando `layout-shift` por `PerformanceObserver` com as fontes dos elementos deslocados:

| Rota             | Deslocamentos                                         | CLS total (3 rodadas) |
| ---------------- | ----------------------------------------------------- | --------------------- |
| `/pt-BR/contact` | 1, em ~2,5 s (quando a fonte IBM Plex Sans 600 chega) | 0,1012 nas 3          |
| `/es/contact`    | 1, em ~2,1 s, mesmo mecanismo                         | 0,1013                |
| `/en/contact`    | 1, em ~2,3 s, só a largura do botão muda              | 0,0007                |

O HTML pré-renderizado já traz o perfil, então nem o esqueleto nem a imagem nem o formulário (desligado, D05) deslocam nada. O que desloca é a **troca da fonte reserva pela IBM Plex Sans 600** (o `font-display: swap` de `global.css`; só as fontes 400 e Bricolage têm `preload`): o texto dos botões "Copiar e-mail" e "Enviar e-mail" (peso 600, classe `.button`) é cerca de 11% a 13% mais largo na fonte reserva (`system-ui`; no Chromium do Linux, DejaVu Sans). Com ela, a linha de ações (`.actions` em `contactChannels.module.css`, `flex-wrap: wrap`) não cabe em 353 px e quebra em duas linhas; com a fonte final (botão "Enviar e-mail" de 184 px para 163 px) cabe numa só. A linha perde 57 px de altura e arrasta junto o bloco Localização e Resposta (`.pair`), o botão "Baixar CV" (`.resume`) e o rodapé: CLS 0,10 de uma vez.

Teste de hipótese (só no `dist/`, sem tocar o código): acrescentar `preload` da fonte 600 deu CLS 0 em 1 de 3 rodadas e 0,1012 nas outras duas. Pré-carregar reduz a chance, mas não elimina o deslocamento, porque a troca ainda depende de quando a rede entrega a fonte.

A E2E existente (`e2e/contact.spec.ts`, NF-DE-02 em 412×823) passa porque mede só até o perfil aparecer e porque as fontes chegam antes; ela mesma se declara "verificação complementar que não discrimina".

## Objetivo

1. Eliminar a diferença de largura do texto antes e depois da fonte chegar, para a quebra de linha da tela Contato não mudar no carregamento: **fonte reserva com métricas ajustadas** à IBM Plex Sans (`@font-face` de fallback com `src: local(...)`, `size-adjust`, `ascent-override`, `descent-override` e `line-gap-override`), um por peso usado (400, 500, 600 e 700), colocada na pilha de `--font-body` entre "IBM Plex Sans" e `system-ui`. Os ajustes saem de medida (largura do mesmo texto na reserva e na fonte final), não de palpite.
2. CLS de `/pt-BR/contact`, `/en/contact` e `/es/contact` no celular abaixo de 0,1, e perto de 0 (alvo da spec: ≤ 0,02), medido como na "Causa medida".
3. Sem mudança visual depois de carregado: a fonte final continua a mesma; só a reserva muda.
4. Um teste que reproduza o defeito: E2E de Contato em 393×851 com as fontes `woff2` atrasadas por `route` (resposta só depois de a página montar), que falha no código atual (CLS ≥ 0,1) e passa com a correção.

## Fora de escopo

- Trocar as fontes, mudar `font-display`, aumentar a lista de `preload` (medido: não resolve sozinho) ou remover peso de fonte.
- Mexer no layout, no formulário (D05, desligado), em textos, chaves de tradução ou na estrutura do HTML.
- Refazer as demais rotas (CLS 0 no pré-check); elas só são medidas de novo para conferir que não pioraram.
- A medição final no Pages publicado (a #41 a fará depois do deploy da correção; esta spec entrega a medição local).

## Casos de borda

- QUANDO o aparelho não tem `Arial`, `Liberation Sans` nem `Helvetica` ENTÃO a reserva cai em `system-ui` como hoje (nada piora; o ganho vale onde a reserva existe, que cobre Windows, macOS, ChromeOS, Linux com Liberation e a maioria dos Android com `Arial` mapeado).
- QUANDO a fonte final já está em cache ENTÃO nada troca e o layout é o mesmo.
- QUANDO a tela é estreita (≤ 330 px) ENTÃO a linha de ações já quebra nas duas fontes e o resultado visual não muda (regra `.emailSkeleton` e `.badgeSlot` da #139 continua).
- QUANDO o idioma é `en`, `es` ou `pt-BR` ENTÃO os três ficam abaixo de 0,1 (o `es` e o `pt-BR` têm o rótulo mais longo).
- QUANDO a mesma pilha serve as outras telas ENTÃO nenhuma delas piora o CLS (conferir Início, Projetos, Projeto e Informações antes e depois).

## Critérios de aceite

- [ ] CA1: CLS de `/pt-BR/contact`, `/en/contact` e `/es/contact` no celular ≤ 0,02 pela medida da "Causa medida" (3 rodadas cada), contra 0,1012 / 0,0007 / 0,1013 de hoje. Evidência: tabela na descrição do PR.
- [ ] CA2: o E2E novo de Contato (393×851, `woff2` atrasado) fica vermelho sem a correção e verde com ela, nos três idiomas; `e2e/support/specClassification.ts` e o ID do requisito (`NF-DE-02`) respeitados. Teste: `e2e/contact.spec.ts`.
- [ ] CA3: `global.css` tem um `@font-face` de reserva por peso de IBM Plex Sans em uso e `--font-body` os lista antes de `system-ui`; `scripts/test/fontWeights.test.ts` segue verde e ganha o caso "todo peso de IBM Plex Sans tem reserva com `size-adjust` e a pilha a cita". Teste: `scripts/test/fontWeights.test.ts`.
- [ ] CA4: as outras rotas (Início, Projetos, Projeto, Informações) têm CLS igual ou menor que o de antes (mesma medida, antes e depois).
- [ ] CA5: sem mudança visual depois de carregado: o HTML pré-renderizado não muda e uma captura de `/pt-BR/contact` carregada (claro e escuro, 393 px) é igual à da `staging`.
- [ ] CA6: `docs/setup/e2e-performance.md` (ou `docs/design/design-system.md`, onde as fontes são descritas) registra a fonte reserva, como se medem os ajustes e o procedimento de medir CLS; testes, lint e typecheck verdes.

## Estratégia de validação

- **Checagens automatizadas:** `scripts/test/fontWeights.test.ts` (reserva por peso); `npm run test:e2e` no CI com o novo caso de Contato; `npm run typecheck` e `npm run lint`.
- **Medição (antes e depois, um build por vez):** `npm run build:fatec` e `PREVIEW_PORT=5178 npm run preview:fatec` (nunca 4173 nem 5173); script de `PerformanceObserver` de `layout-shift` com Chromium em perfil Pixel 5, rede 150 ms/1,6 Mb/s e CPU 4x, três rodadas por idioma; opcionalmente Lighthouse mobile da rota. A medição final no Pages é da #41.
- **Medição dos ajustes:** para cada peso, renderizar o mesmo texto (os rótulos de botão e os parágrafos da tela) na fonte final e na reserva e calcular `size-adjust` pela razão das larguras; `ascent-override`, `descent-override` e `line-gap-override` pelas métricas da IBM Plex Sans (`hhea`) divididas por `size-adjust`.
- **Rollback / mitigação:** `git revert` do PR; só CSS e um teste mudam, sem dado nem contrato.

## Questões em aberto (para o PO)

1. **Estratégia.** Proposta: fonte reserva com métricas ajustadas (corrige a causa em todas as telas e não depende da rede). Alternativas: (B) forçar a linha de ações a não quebrar de 353 px em diante, que remendaria só este botão e pode estourar a borda por instantes; (C) só `preload` da fonte 600 (medido: não resolve, 1 de 3 rodadas). Recomendo A.
2. **Alcance dos pesos.** Proposta: reserva para 400, 500, 600 e 700 de IBM Plex Sans (todos em uso) e nenhuma para Bricolage Grotesque (já tem `preload`, e o título não deslocou nas medições). Confirma?
3. **Script de medição.** Proposta: não versionar o script de CLS (o E2E novo cobre a regressão) e documentar o procedimento. Alternativa: versionar `scripts/measureLayoutShift.ts` com `npm run measure:cls`. Qual?

## Notas / decisões

- **Por que não reservar altura.** A linha de ações _encolhe_ (duas linhas viram uma), então uma altura mínima não impede os blocos abaixo de subirem; a correção precisa fazer a quebra de linha ser a mesma antes e depois da troca da fonte.
- **Por que as três medidas num só mecanismo.** `pt-BR` e `es` têm o rótulo "Enviar e-mail"/"Enviar correo" mais largo que `en` ("Send email"), por isso o `en` só mexe a largura do botão (0,0007) e os outros dois quebram a linha.
- **Relação com #139.** A #139 reservou as alturas do esqueleto e do selo de disponibilidade em Contato; esta é outra causa (troca de fonte), no estado já carregado.
- **Medida local x publicada.** O ambiente local usa DejaVu Sans como `system-ui`, mais larga que a de um Android real; por isso a medição final e a decisão de fechar a #41 são no Pages.
- **PR.** Referenciar "Relacionada à #41" no corpo, sem `Closes #41`; `Closes #266`.
- **R1, R2 e R3.** Sem texto de UI novo; sem decisão de design aplicável (a fonte final não muda).
- **Desvio na implementação (valores e teste).** (1) Os `size-adjust` de 600 e 700 não são a razão do corpus (96,12% e 97,47%), e sim 97,5% e 98,21% (mediana dos rótulos de interface mais folga): com 96,12% a linha de botões do Início em `en` passava a quebrar só depois da troca (CLS 0,092, contra 0,0002 antes), uma regressão fora de Contato achada pela medição de todas as rotas (CA4). Há uma janela estreita para o peso 600: de 97,0% para cima o Início em `en` fica em 0, e de 97,0% para cima o E2E com todas as fontes atrasadas dá 0,12 em `es`. (2) Por isso o E2E atrasa só os `woff2` sem `preload` (500, 600 e 700), que é o cenário real (400 e Bricolage chegam antes); com as quatro fontes atrasadas a janela some. (3) O E2E fica vermelho sem a reserva em pelo menos um idioma (medido: 0,1015); não nos três, porque sem CPU limitada o `en` quase não desloca.
- **Aprovação do desvio.** O Felipe aprovou, por meio do Orc, em 12/11/2026, o desvio acima (`size-adjust` de 97,5% no peso 600 e 98,21% no 700, e o E2E atrasando só as fontes sem `preload`).
