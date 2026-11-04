# tela-projetos

> Status: `implementada`
> Encerrada em: `2026-10-25`
> Commits: `7436394^..ee5be32` · PR: — · Issue: [#35](https://github.com/felipe-sant/portfolio-frontend/issues/35)

## O que foi pedido

Entregar a tela Projetos (`/projects`) nos três idiomas: busca, filtros por tipo e categoria, lista paginada com cards, estados de carregando, erro e vazio, SEO, pré-renderização e E2E, com dados mock da camada local (R1).

## O que foi feito

A tela usa `getProjectsPages` (`build.infiniteQuery`, lotes de 9) e `getProjectFilterOptions`; a query vive na URL e a quantidade de páginas em `location.state.pages`. `buildProjectsQueryArgs` omite todo valor padrão para a chave de cache do servidor e do cliente coincidir e a hidratação achar o cache. O plano mudou três vezes por pedido do PO durante a verificação manual, todas registradas em `docs/design/decisions.md`:

- D61: ordenação em dropdown próprio (`SelectField`), depois substituída pela D63.
- D62: modal de filtros por tecnologia e ano (E entre tecnologias, OU entre anos); `Modal` genérico com foco preso e `ProjectsFiltersModal` com rascunho aplicado ao fechar.
- D63: ordenação movida para dentro do modal, como grupo de radios.
- D64: opções do modal por requisição própria, com as sem uso desabilitadas.
- D65: cache de leitura da camada local e `ItemList` do JSON-LD vindo do primeiro lote, o que removeu a consulta de índice.
- D66: fundo do rodapé no tema claro.

Ajustes pedidos pelo PO depois do fluxo completo: estado vazio centralizado com `min-height: calc(100svh - 24rem)`; remoção de Git e GitHub da stack do perfil e de uma tecnologia de projeto (conteúdo nos três idiomas); arrasto com o mouse na linha de filtros por `useDragScroll`, com limiar de 4px e guarda de `buttons` para não capturar o ponteiro no clique simples.

## Notas

- Verificação final: 970 E2E passaram (38 ignorados, 0 falhas), 1535 testes de unidade passaram (1 pulado), typecheck, lint e `build:fatec` verdes.
- #43: a migração para o backend troca cada `queryFn` por `query`; busca, filtros, ordenação, paginação e opções saem do frontend e o cache de leitura sai com a camada local.
- #101: BUG-3, busca perdida em cliques rápidos com CPU lenta; fora desta entrega.
- #100: RF-LAY-14 segue com `test.fail` ligado a essa issue.
- Conferência no build publicado do GitHub Pages (#45) continua com o PO.
