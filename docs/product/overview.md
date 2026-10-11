# Visão do produto

Portfólio pessoal de Luiz Felipe dos Santos, desenvolvedor full stack em TypeScript. Este repositório é o frontend do portfólio; o design vem do handoff em `/home/felipe/faculdade/design_handoff_portfolio`.

## Propósito

Converter visita em contato. O site mostra o trabalho do autor com profundidade suficiente para que quem visita entenda como ele resolve problemas, e não apenas quais tecnologias já usou.

## Público

- Recrutadores avaliando o autor para uma vaga.
- Clientes avaliando o autor para um projeto ou freelance.

## Papéis

O usuário deste repositório é ao mesmo tempo **cliente** (dono do portfólio), **PO** (decide escopo e prioridade) e **dev** (implementa). Decisões de produto e de design são dele; o handoff registra as que já foram tomadas.

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
- **R3 — O handoff é a fonte de verdade do design.** Tokens, componentes, voz e copy, acessibilidade e responsividade seguem o handoff; as convenções do repositório prevalecem onde divergem (fonte self-hospedada em vez de Google Fonts, CSS Module em vez de classe global `.ds-*`, código sem comentários). A ordem de precedência é: convenções do repositório, depois [`decisions.md`](../design/decisions.md), depois o [protótipo navegável](../design/prototype/README.md), depois o handoff.

## Decisões de design

Os pontos que o handoff deixava em aberto estão decididos em [`decisions.md`](../design/decisions.md), com opções, fonte e data:

1. **Menu mobile (D01):** abaixo de 640px a navegação vira um botão de 44px que abre um painel em largura total abaixo do cabeçalho, com os links, o seletor de idioma e o alternador de tema.
2. **Logo (D02):** o gato ao lado do nome "Luiz Felipe dos Santos", em SVG inline com as cores do tema. Os SVGs-fonte estão em [`design/assets/logo/`](../design/assets/logo/).
3. **Imagens reais (D03):** placeholders neutros 16:9 e 1:1 pelo menos até a primeira entrega na `main`; capturas reais dos projetos e foto de perfil entram depois da v1. Os sketches do handoff não vão para produção.
4. **Rodapé (D04):** linha superior em degradê e fundo neutro, pelos tokens `--surface-chrome` e `--border-chrome`; em Contato ele vira navegação.
5. **Formulário de contato (D05):** implementado no frontend com envio simulado (R1) e escondido em produção atrás de uma flag até o backend existir; endpoint real e proteção contra spam vêm depois.
6. **Renderizador de markdown (D06):** `react-markdown` com `rehype-highlight`, sem HTML embutido, com as cores de realce do protótipo.

O único item à espera de material é o CV em PDF por idioma (D14).

## Fora de escopo

- **Backend:** não faz parte deste repositório. Enquanto ele não existe, os dados são mock (R1).
- **Paginação numerada na listagem de projetos:** o carregamento é sempre incremental ("Carregar mais").
- **Newsletter e cadastro de visitante:** o contato é só a mensagem e os canais diretos.
- **Idiomas além de `pt-BR`, `en` e `es`** (R2).
