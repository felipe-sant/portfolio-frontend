# requisitos-layout

> Status: `implementada`
> Encerrada em: `2026-10-11`
> Commits: `f9f97ba..56432eb` · PR: [#24](https://github.com/felipe-sant/portfolio-frontend/pull/24) · Issue: [#2](https://github.com/felipe-sant/portfolio-frontend/issues/2)

## O que foi pedido

Cabeçalho, menu mobile, rodapé, tema, idioma, página não encontrada, página de erro e metadados aparecem em todas as telas, mas o comportamento estava espalhado entre decisões, acessibilidade, requisitos não funcionais e o protótipo. A issue de layout (M3) precisava de um documento para cobrir por teste.

## O que foi feito

Criou `docs/screens/layout.md` a partir de `docs/screens/_template.md`, com as seis seções do molde mais Textos fixos e chaves, Metadados por rota e idioma e Critérios de aceite. Cada requisito tem ID estável `RF-LAY-nn`. O corpo da issue estava desatualizado e a spec registrou, em tabela, onde cada ponto foi superado (logo do gato, menu em largura total, seletor `PT · EN · ES` por links, idioma pela URL, "Entrar em contato", tema com nome fixo e `aria-pressed`, ano do rodapé pelo build).
