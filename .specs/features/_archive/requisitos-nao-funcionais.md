# requisitos-nao-funcionais

> Status: `implementada`
> Encerrada em: `2026-10-11`
> Commits: `bbab0ca..c661634` · PR: [#23](https://github.com/felipe-sant/portfolio-frontend/pull/23) · Issue: [#8](https://github.com/felipe-sant/portfolio-frontend/issues/8)

## O que foi pedido

Os requisitos que valem para todas as telas estavam espalhados (R1–R3, idioma, tema, fontes, restrições do GitHub Pages) e não havia meta numérica de desempenho nem decisão escrita sobre SEO, Open Graph, `robots.txt`, `sitemap.xml`, URL canônica, compatibilidade de navegadores ou privacidade. A issue de verificação da v1 conferiria "as metas da #8", que não existiam.

## O que foi feito

Criou `docs/product/non-functional-requirements.md`, com uma seção por tema (internacionalização, fonte local de conteúdo, desempenho, responsividade, temas, movimento, legibilidade por IA e buscadores, privacidade, compatibilidade, qualidade e CI, hospedagem no GitHub Pages, referência à acessibilidade). Todo requisito tem ID `NF-<TEMA>-nn`, texto verificável e forma de verificação. O documento fecha com Decisões registradas e Roteiro de verificação.
