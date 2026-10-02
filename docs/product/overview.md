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
- **R3 — O handoff é a fonte de verdade do design.** Tokens, componentes, voz e copy, acessibilidade e responsividade seguem o handoff; as convenções do repositório prevalecem onde divergem (fonte self-hospedada em vez de Google Fonts, CSS Module em vez de classe global `.ds-*`, código sem comentários).

## Pendências conhecidas

Pontos que o handoff deixa em aberto:

1. **Menu mobile:** abaixo de 640px a navegação do cabeçalho vira um botão de menu, mas o painel aberto não foi desenhado e precisa de definição antes de ser implementado.
2. **Logo:** não existe. O cabeçalho usa um placeholder quadrado tracejado com o texto `LOGO` ao lado do nome; ao receber o arquivo, o placeholder é substituído e o nome continua ao lado.
3. **Imagens reais:** não existe nenhuma. Os dez `assets/proj-*.png` do handoff são sketches desenhados em canvas e não vão para produção; devem ser trocados por capturas reais dos projetos, sempre em 16:9. Foto de perfil também é placeholder.
4. **Rodapé:** a decisão final foi manter a linha superior em degradê e o fundo neutro. Se o fundo em degradê voltar, botões e textos internos passam para tinta `#202020` cheia.
5. **Backend do formulário de contato:** no protótipo a submissão é simulada. Falta endpoint real, proteção contra spam e tratamento de falha (o banner de erro já existe no design system).
6. **Renderizador de markdown:** no protótipo a documentação do projeto é HTML escrito à mão. No código, a documentação é renderizada por uma biblioteca (o handoff sugere `react-markdown` com `rehype-highlight`) com as cores de realce documentadas no handoff.

## Fora de escopo

- **Backend:** não faz parte deste repositório. Enquanto ele não existe, os dados são mock (R1).
- **Paginação numerada na listagem de projetos:** o carregamento é sempre incremental ("Carregar mais").
- **Newsletter e cadastro de visitante:** o contato é só a mensagem e os canais diretos.
- **Idiomas além de `pt-BR`, `en` e `es`** (R2).
