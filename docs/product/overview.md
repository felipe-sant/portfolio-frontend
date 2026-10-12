# Visão do produto

Portfólio pessoal de Luiz Felipe dos Santos, desenvolvedor full stack em TypeScript. Este repositório é o frontend do portfólio; o design vem do handoff em `/home/felipe/faculdade/design_handoff_portfolio`.

## Propósito

Converter visita em contato. O site mostra o trabalho do autor com profundidade suficiente para que quem visita entenda como ele resolve problemas, e não apenas quais tecnologias já usou.

Na v1 o propósito imediato é a entrega da faculdade (Fatec), avaliada pelo professor. Converter visita em contato vale nas duas fases e é o único propósito a partir da V2 ([`roadmap.md`](roadmap.md), Versões).

## Público e jornadas

Três públicos. O professor é público da v1 (`DP01`); recrutador e cliente são das duas fases (handoff, "Visão geral", transcrito no "Público" desta página no commit `e974b8b`).

| Público                      | Fase     | De onde chega                                                    | O que procura                                                                                     | Telas que respondem                                                                  | Ação final esperada                                                                                                                                                   |
| ---------------------------- | -------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Professor/avaliador da Fatec | v1       | URL do GitHub Pages e vídeo de demonstração entregues pelo autor | Se a entrega cumpre o pedido: cinco telas com conteúdo real, três idiomas, dois temas, responsiva | Todas: `/` → `/projects` → `/projects/:id` → `/about` → `/contact`                   | Em `/projects/:id`, "Ver código no GitHub" de um projeto                                                                                                              |
| Recrutador                   | v1 e V2+ | Link no LinkedIn, no CV ou na candidatura                        | Perfil para vaga fixa: o que faz agora, stack, trajetória, formação e um projeto em profundidade  | `/` (status atual, destaques) → `/about` (sobre mim, stack, trajetória) → um projeto | "Baixar CV" em `/about` ou no hero de `/` (D14); alternativa: LinkedIn no rodapé (D04)                                                                                |
| Cliente (projeto/freelance)  | v1 e V2+ | Indicação, GitHub ou LinkedIn                                    | Projeto parecido com o problema dele, como o autor trabalha e em quanto tempo responde            | `/` → `/projects` (busca e filtros) → `/projects/:id` → `/contact`                   | v1: em `/contact`, "Copiar" o e-mail direto, ou abri-lo pelo link de e-mail do rodapé das outras telas (D05, D21); V2+: "Enviar mensagem" pelo formulário (issue #44) |

Fontes de cada linha: o [protótipo](../design/prototype/README.md) para os rótulos dos botões ("Ver código no GitHub" em `prototipo-projeto`, "Baixar CV" em `prototipo-inicio`, `prototipo-informacoes` e `prototipo-contato`, "Copiar" em `prototipo-contato` e "Copiar e-mail" no rodapé), D14 para o CV por idioma, D21 para os canais de Contato sem agendamento e sem lista de redes, D04 para as redes no rodapé e D05 para o formulário desligado na v1.

## Papéis

O usuário deste repositório é ao mesmo tempo **cliente** (dono do portfólio), **PO** (decide escopo e prioridade) e **dev** (implementa). Decisões de produto e de design são dele; o handoff registra as que já foram tomadas.

O PO aprova a spec (Status `aprovada`) e o escopo de cada versão; mudar o escopo de uma versão muda [`roadmap.md`](roadmap.md) no mesmo PR. O professor avalia a v1, mas não decide escopo.

## Objetivos e sinais de sucesso

| Fase | Objetivo                                         | Sinal de sucesso                                                                                            | Como é verificado                                                           |
| ---- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| v1   | Entregar a v1 aprovada pela Fatec até 22/11/2026 | Todos os itens da definição da v1 em [`roadmap.md`](roadmap.md#v1) marcados; URL e vídeo entregues no prazo | Checklist da v1, CI (build, lint, testes com 80% ou mais) e verificação #41 |
| v1   | Mostrar trabalho com profundidade                | Todo projeto publicado tem estudo de caso (documentação, ficha técnica e galeria ou placeholder, D26)       | Revisão do conteúdo de #58 pelo PO                                          |
| V2+  | Converter visita em contato                      | Não definido agora: a métrica é definida junto com a ferramenta de analytics na V2 (`DP02`)                 | Pela ferramenta de analytics escolhida na V2                                |

**Medição (`DP02`):**

- **v1 sem analytics.** O público que importa na v1 é um avaliador, o site roda no repositório da organização da Fatec e o projeto evita requisição a terceiros (fontes self-hospedadas, D09, e privacidade da #8, em [NF-PR](non-functional-requirements.md#privacidade-nf-pr)). Cliques em "Baixar CV", "Copiar" e nos links de rede não são medidos na v1.
- **V2+: analytics sem cookie.** Vercel Web Analytics ou Plausible, escolhido numa issue ou ADR da V2, junto com a métrica de sucesso da V2+. A política de privacidade e a regra de terceiros estão em [`non-functional-requirements.md`](non-functional-requirements.md#privacidade-nf-pr) (NF-PR, #8).

## Escopo

Cinco rotas, cada uma com o propósito definido no handoff e o caminho em inglês de D32. A coluna Fonte cita o handoff e o protótipo da tela e as decisões principais de cada uma, as mesmas da tabela "Decisões por tela" de [`roadmap.md`](roadmap.md#m5--telas) (M5):

| Rota            | Tela        | Propósito                                                                                                                                                                                   | Fonte                                                           |
| --------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `/`             | Início      | Primeira impressão: quem é, o que faz agora (status atual), quatro projetos em destaque e faixa de stack                                                                                    | Handoff, `prototipo-inicio`; D26, D11, D13, D14, D24            |
| `/projects`     | Projetos    | Encontrar um projeto por busca, tipo, categoria ou tecnologia, com ordenação e carregamento incremental                                                                                     | Handoff, `prototipo-projetos`; D16, D17                         |
| `/projects/:id` | Projeto     | Contar como o problema foi resolvido, como estudo de caso: galeria, documentação em markdown (cada documento com endereço próprio: `/architecture`, `/setup`, `/changelog`) e ficha técnica | Handoff, `prototipo-projeto`; D06, D10, D18, D19, D33, PI1, PI2 |
| `/about`        | Informações | Quem é o autor, o que domina e por onde passou: sobre mim, stack, complementos e trajetória com modal de detalhe                                                                            | Handoff, `prototipo-informacoes`; D13, D14, D20, PI1            |
| `/contact`      | Contato     | Dar o canal direto (e-mail, CV) para quem quer falar com o autor; o formulário existe, mas está desligado na v1 e é ligado na V2+                                                           | Handoff, `prototipo-contato`; D05, D07, D21, D25                |

- Cabeçalho igual nas cinco telas, com o item da rota atual destacado; rodapé igual em quatro delas (em `/contact` ele vira navegação). Fonte: handoff; protótipo, `ProtoHeader` e `ProtoFooter`; D01, D02, D04.
- Temas claro e escuro, trocados por `data-theme` na raiz, com a escolha persistida e `prefers-color-scheme` respeitado na primeira visita. Fonte: D22.
- Interface em três idiomas: `pt-BR` (língua de referência), `en` e `es`, com cada rota em três URLs: sem prefixo em `pt-BR`, `/en/` e `/es/` (#53, `D31`). Fonte: R2; D12; D31.
- Página não encontrada e página de erro. Fonte: protótipo, `prototipo-404` e `prototipo-erro`; [`roadmap.md`](roadmap.md#v1), definição da v1.
- CV em PDF por idioma, baixado pelo idioma ativo. Fonte: D14, D30 (gerado do JSON).
- Conteúdo real em JSON local na v1, no formato do contrato da API. Fonte: [`roadmap.md`](roadmap.md#m2--conteúdo-real), M2; R1.

## Fora de escopo

Já decididos no handoff, no protótipo, nos requisitos, em [`decisions.md`](../design/decisions.md) ou em [`roadmap.md`](roadmap.md):

- **Backend:** não faz parte deste repositório. Enquanto ele não existe, os dados são mock (R1). Fonte: R1 e [`roadmap.md`](roadmap.md#v1), v1.
- **Paginação numerada na listagem de projetos:** o carregamento é sempre incremental ("Carregar mais"). Fonte: protótipo, `prototipo-projetos`; D16, D17.
- **Newsletter e cadastro de visitante:** o contato é só a mensagem e os canais diretos. Fonte: protótipo, `prototipo-contato` ("Sem newsletter e sem cadastro").
- **Idiomas além de `pt-BR`, `en` e `es`** (R2).
- **Depoimentos** (D13).
- **Agendamento de conversa e lista de redes na coluna de Contato** (D21).
- **Envio real do formulário na v1:** volta na V2+, pela issue #44 (D05).
- **Deploy na Vercel, domínio próprio e AWS como requisito da v1** ([`roadmap.md`](roadmap.md#v1), v1).
- **Analytics na v1** (`DP02`).

Decididos pelo PO, valendo para a v1 e a V2+ (`DP03`):

- **Área logada ou painel administrativo.**
- **Blog ou artigos.**
- **CMS de terceiros ou próprio.**
- **Comentários, chat ou qualquer interação de visitante além dos canais de contato.**

A edição de conteúdo, quando existir, será **outro app**, não este frontend. Na v1 o conteúdo é editado em arquivo (JSON local); na V2+ vem do backend.

## Requisitos do projeto

Valem para toda feature e toda tarefa.

- **R1 — Frontend-only com dados mock no início.** O backend ainda não existe. A aplicação funciona sozinha, com dados mock de projetos, trajetória e demais conteúdo exigido pelo handoff. Os dados virão do backend no futuro, então a infraestrutura de Redux Toolkit, RTK Query e `src/services/http/` fica no projeto. Na v1 o conteúdo é o real do PO: "mock" quer dizer só que a fonte é local, no formato do contrato de #10, trocável pela API sem mexer nas telas ([`roadmap.md`](roadmap.md#m2--conteúdo-real), M2).
- **R2 — Tradução obrigatória em `pt-BR`, `en` e `es`.** Toda feature e toda tarefa que cria ou altera texto de UI entrega o texto nos três idiomas; `pt-BR` é a referência. Chave de tradução sem uso é removida.
- **R3 — O design segue as decisões, o protótipo e o handoff.** Tokens, componentes, voz e copy, acessibilidade e responsividade seguem o handoff; as convenções do repositório prevalecem onde divergem (fonte self-hospedada em vez de Google Fonts, CSS Module em vez de classe global `.ds-*`, código sem comentários). A ordem de precedência é: convenções do repositório, depois [`decisions.md`](../design/decisions.md), depois o [protótipo navegável](../design/prototype/README.md), depois o handoff.

Os requisitos que valem para todas as telas (idioma, conteúdo local, desempenho, temas, legibilidade por IA, privacidade, navegadores e hospedagem) estão em [`non-functional-requirements.md`](non-functional-requirements.md), com a forma de verificação de cada um.

## Decisões de design

Os pontos que o handoff deixava em aberto estão decididos em [`decisions.md`](../design/decisions.md), com opções, fonte e data:

1. **Menu mobile (D01):** abaixo de 640px a navegação vira um botão de 44px que abre um painel em largura total abaixo do cabeçalho, com os links, o seletor de idioma e o alternador de tema.
2. **Logo (D02):** o gato ao lado do nome "Luiz Felipe dos Santos", em SVG inline com as cores do tema. Os SVGs-fonte estão em [`design/assets/logo/`](../design/assets/logo/).
3. **Imagens reais (D26, que substitui D03):** capturas reais dos projetos (16:9) e foto de perfil (1:1) entram na v1; projeto sem captura mantém o placeholder neutro 16:9. Os sketches do handoff não vão para produção.
4. **Rodapé (D04):** linha superior em degradê e fundo neutro, pelos tokens `--surface-chrome` e `--border-chrome`; em Contato ele vira navegação.
5. **Formulário de contato (D05):** implementado no frontend com envio simulado (R1) e escondido em produção atrás de uma flag até o backend existir; endpoint real e proteção contra spam vêm depois.
6. **Renderizador de markdown (D06):** `react-markdown` com `rehype-highlight`, sem HTML embutido, com as cores de realce do protótipo.

Os itens à espera de material são o conteúdo do CV no JSON (D30) e as capturas e a foto (D26).

## Decisões de produto

Decisões de escopo e de público tomadas pelo PO. Os IDs `DPnn` não colidem com `Dnn` e `PIn` de [`decisions.md`](../design/decisions.md), que são de design.

| ID   | Decisão                                                                                                                                                                                           | Fonte | Data       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ---------- |
| DP01 | O professor/avaliador da Fatec é público da v1, com jornada própria                                                                                                                               | PO    | 11-10-2026 |
| DP02 | v1 sem analytics; na V2+, analytics sem cookie (Vercel Web Analytics ou Plausible), escolhido numa issue ou ADR da V2 junto com a métrica de sucesso da V2+; a política de privacidade fica na #8 | PO    | 11-10-2026 |
| DP03 | Área logada ou painel, blog, CMS e comentários ou chat ficam fora deste frontend na v1 e na V2+; a edição de conteúdo, quando existir, será outro app                                             | PO    | 11-10-2026 |

## Roadmap

A v1 é a entrega da faculdade (Fatec), publicada no GitHub Pages de um repositório da organização da Fatec, com o conteúdo real servido localmente e sem backend. As versões V2+ são de uso pessoal. A ordem das entregas e o critério de cada versão estão em [`roadmap.md`](roadmap.md).
