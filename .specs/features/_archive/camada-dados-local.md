# camada-dados-local

> Status: `implementada`
> Encerrada em: `2026-10-12`
> Commits: `43eb9c8..8381fa0` · PR: [#73](https://github.com/felipe-sant/portfolio-frontend/pull/73) · Issue: [#13](https://github.com/felipe-sant/portfolio-frontend/issues/13)

## O que foi pedido

O backend não existe (R1) e a v1 usa dados em JSON local. O contrato da #10 estava mergeado, mas o código não tinha nenhuma peça dele: nenhum tipo, endpoint ou JSON, e a store só tinha o `createApi` vazio. Sem isso as telas não tinham de onde ler.

## O que foi feito

Entregou a camada que faz o papel do backend na v1, no formato do contrato e trocável pela API mexendo só em `src/store/api/` e nos serviços que ela chama: tipos em `src/types/`, endpoints do RTK Query com `queryFn` que chama `src/services/content/`, o conteúdo de exemplo em `public/content/<idioma>/`, o modelo em branco, a validação do conteúdo e os comandos `content:*`. O `lang` vai explícito no argumento de cada endpoint, para o cache do RTK Query ser por idioma.

## Notas

Fora do escopo: conteúdo real (#58), tradução do conteúdo (#59), as telas (#34 a #38) e o envio do formulário de contato (#38, #44). A troca da fonte local pela API é a #43.
