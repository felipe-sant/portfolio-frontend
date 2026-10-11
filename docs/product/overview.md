# Visão do produto

Portfólio pessoal de Luiz Felipe dos Santos, desenvolvedor full stack em TypeScript. Este repositório é o frontend do portfólio; o design vem do handoff em `/home/felipe/faculdade/design_handoff_portfolio`.

## Propósito

Converter visita em contato. O site mostra o trabalho do autor com profundidade suficiente para que quem visita entenda como ele resolve problemas, e não apenas quais tecnologias já usou.

Na v1 o propósito imediato é a entrega da faculdade (Fatec), avaliada pelo professor. Converter visita em contato vale nas duas fases e é o único propósito a partir da V2 ([`roadmap.md`](roadmap.md), Versões).

## Público e jornadas

Três públicos. O professor é público da v1 (`DP01`); recrutador e cliente são das duas fases (handoff, "Visão geral").

| Público                      | Fase     | De onde chega                                                    | O que procura                                                                                     | Telas que respondem                                                                        | Ação final esperada                                                                                                 |
| ---------------------------- | -------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Professor/avaliador da Fatec | v1       | URL do GitHub Pages e vídeo de demonstração entregues pelo autor | Se a entrega cumpre o pedido: cinco telas com conteúdo real, três idiomas, dois temas, responsiva | Todas: `/` → `/projetos` → `/projetos/:slug` → `/informacoes` → `/contato`                 | Em `/projetos/:slug`, "Ver código no GitHub" de um projeto                                                          |
| Recrutador                   | v1 e V2+ | Link no LinkedIn, no CV ou na candidatura                        | Perfil para vaga fixa: o que faz agora, stack, trajetória, formação e um projeto em profundidade  | `/` (status atual, destaques) → `/informacoes` (sobre mim, stack, trajetória) → um projeto | "Baixar CV" em `/informacoes` ou no hero de `/` (D14); alternativa: LinkedIn no rodapé (D04)                        |
| Cliente (projeto/freelance)  | v1 e V2+ | Indicação, GitHub ou LinkedIn                                    | Projeto parecido com o problema dele, como o autor trabalha e em quanto tempo responde            | `/` → `/projetos` (busca e filtros) → `/projetos/:slug` → `/contato`                       | v1: em `/contato`, "Copiar" o e-mail direto ou abri-lo (D05, D21); V2+: "Enviar mensagem" pelo formulário (issue N) |

Fontes de cada linha: o [protótipo](../design/prototype/README.md) para os rótulos dos botões ("Ver código no GitHub" em `prototipo-projeto`, "Baixar CV" em `prototipo-inicio`, `prototipo-informacoes` e `prototipo-contato`, "Copiar" em `prototipo-contato` e no rodapé), D14 para o CV por idioma, D21 para os canais de Contato sem agendamento e sem lista de redes, D04 para as redes no rodapé e D05 para o formulário desligado na v1.

## Papéis

O usuário deste repositório é ao mesmo tempo **cliente** (dono do portfólio), **PO** (decide escopo e prioridade) e **dev** (implementa). Decisões de produto e de design são dele; o handoff registra as que já foram tomadas.

O PO aprova a spec (Status `aprovada`) e o escopo de cada versão; mudar o escopo de uma versão muda [`roadmap.md`](roadmap.md) no mesmo PR. O professor avalia a v1, mas não decide escopo.

## Objetivos e sinais de sucesso

| Fase | Objetivo                                         | Sinal de sucesso                                                                                            | Como é verificado                                                         |
| ---- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| v1   | Entregar a v1 aprovada pela Fatec até 23/11/2026 | Todos os itens da definição da v1 em [`roadmap.md`](roadmap.md#v1) marcados; URL e vídeo entregues no prazo | Checklist da v1, CI (build, lint, testes com 80% ou mais) e verificação K |
| v1   | Mostrar trabalho com profundidade                | Todo projeto publicado tem estudo de caso (documentação, ficha técnica e galeria ou placeholder, D26)       | Revisão do conteúdo de #13 pelo PO                                        |
| V2+  | Converter visita em contato                      | Não definido agora: a métrica é definida junto com a ferramenta de analytics na V2 (`DP02`)                 | Pela ferramenta de analytics escolhida na V2                              |

**Medição (`DP02`):**

- **v1 sem analytics.** O público que importa na v1 é um avaliador, o site roda no repositório da organização da Fatec e o projeto evita requisição a terceiros (fontes self-hospedadas, D09, e privacidade da #8). Cliques em "Baixar CV", "Copiar" e nos links de rede não são medidos na v1.
- **V2+: analytics sem cookie.** Vercel Web Analytics ou Plausible, escolhido numa issue ou ADR da V2, junto com a métrica de sucesso da V2+. A política de privacidade e a regra de terceiros são da #8.

## Escopo

Cinco rotas, cada uma com o propósito definido no handoff:

| Rota              | Tela        | Propósito                                                                                                        |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `/`               | Início      | Primeira impressão: quem é, o que faz agora (status atual), quatro projetos em destaque e faixa de stack         |
| `/projetos`       | Projetos    | Encontrar um projeto por busca, tipo, categoria ou tecnologia, com ordenação e carregamento incremental          |
| `/projetos/:slug` | Projeto     | Contar como o problema foi resolvido, como estudo de caso: galeria, documentação em markdown e ficha técnica     |
| `/informacoes`    | Informações | Quem é o autor, o que domina e por onde passou: sobre mim, stack, complementos e trajetória com modal de detalhe |
| `/contato`        | Contato     | Receber mensagem qualificada pelo formulário ou dar o canal direto para quem prefere                             |

- Cabeçalho igual nas cinco telas, com o item da rota atual destacado; rodapé igual em quatro delas (em `/contato` ele vira navegação).
- Temas claro e escuro, trocados por `data-theme` na raiz, com a escolha persistida e `prefers-color-scheme` respeitado na primeira visita.
- Interface em três idiomas: `pt-BR` (língua de referência), `en` e `es`.

## Requisitos do projeto

Valem para toda feature e toda tarefa.

- **R1 — Frontend-only com dados mock no início.** O backend ainda não existe. A aplicação funciona sozinha, com dados mock de projetos, trajetória e demais conteúdo exigido pelo handoff. Os dados virão do backend no futuro, então a infraestrutura de Redux Toolkit, RTK Query e `src/services/http/` fica no projeto.
- **R2 — Tradução obrigatória em `pt-BR`, `en` e `es`.** Toda feature e toda tarefa que cria ou altera texto de UI entrega o texto nos três idiomas; `pt-BR` é a referência. Chave de tradução sem uso é removida.
- **R3 — O design segue as decisões, o protótipo e o handoff.** Tokens, componentes, voz e copy, acessibilidade e responsividade seguem o handoff; as convenções do repositório prevalecem onde divergem (fonte self-hospedada em vez de Google Fonts, CSS Module em vez de classe global `.ds-*`, código sem comentários). A ordem de precedência é: convenções do repositório, depois [`decisions.md`](../design/decisions.md), depois o [protótipo navegável](../design/prototype/README.md), depois o handoff.

## Decisões de design

Os pontos que o handoff deixava em aberto estão decididos em [`decisions.md`](../design/decisions.md), com opções, fonte e data:

1. **Menu mobile (D01):** abaixo de 640px a navegação vira um botão de 44px que abre um painel em largura total abaixo do cabeçalho, com os links, o seletor de idioma e o alternador de tema.
2. **Logo (D02):** o gato ao lado do nome "Luiz Felipe dos Santos", em SVG inline com as cores do tema. Os SVGs-fonte estão em [`design/assets/logo/`](../design/assets/logo/).
3. **Imagens reais (D26, que substitui D03):** capturas reais dos projetos (16:9) e foto de perfil (1:1) entram na v1; projeto sem captura mantém o placeholder neutro 16:9. Os sketches do handoff não vão para produção.
4. **Rodapé (D04):** linha superior em degradê e fundo neutro, pelos tokens `--surface-chrome` e `--border-chrome`; em Contato ele vira navegação.
5. **Formulário de contato (D05):** implementado no frontend com envio simulado (R1) e escondido em produção atrás de uma flag até o backend existir; endpoint real e proteção contra spam vêm depois.
6. **Renderizador de markdown (D06):** `react-markdown` com `rehype-highlight`, sem HTML embutido, com as cores de realce do protótipo.

Os itens à espera de material são o CV em PDF por idioma (D14) e as capturas e a foto (D26).

## Roadmap

A v1 é a entrega da faculdade (Fatec), publicada no GitHub Pages de um repositório da organização da Fatec, com o conteúdo real servido localmente e sem backend. As versões V2+ são de uso pessoal. A ordem das entregas e o critério de cada versão estão em [`roadmap.md`](roadmap.md).

## Fora de escopo

- **Backend:** não faz parte deste repositório. Enquanto ele não existe, os dados são mock (R1).
- **Paginação numerada na listagem de projetos:** o carregamento é sempre incremental ("Carregar mais").
- **Newsletter e cadastro de visitante:** o contato é só a mensagem e os canais diretos.
- **Idiomas além de `pt-BR`, `en` e `es`** (R2).
