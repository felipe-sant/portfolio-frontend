# cabecalho-navegacao-menu-idioma-tema

> Status: `implementada`
> Encerrada em: `2026-10-20`
> Commits: `origin/staging..feat/33-cabecalho-navegacao-menu-idioma-tema` · PR: `a preencher` · Issue: `https://github.com/felipe-sant/portfolio-frontend/issues/33`

## O que foi pedido

Primeira parte do layout compartilhado: cabeçalho fixo com navegação, menu mobile, seletor de idioma, alternador de tema, link de pular conteúdo, main único, foco no h1 na troca de rota e favicon do gato.

## O que foi feito

Componentes CatLogo, IconButton, ThemeToggle, LanguageSelector, Header e SkipLink; hooks useMobileMenu (disclosure com inert, foco preso e rolagem travada) e useRouteFocus; getActiveNavItem; textos em common nos três idiomas; MainLayout com main único e ScrollRestoration; Home e NotFound deixam de renderizar main. O seletor usa fieldset com legend oculto e o fechamento do menu por rota ignora troca só de prefixo de idioma.

## Notas

Links de Projetos, Informações e Contato levam à não encontrada até as telas existirem. Validação visual de CSS e amostra de NVDA ficam com o PO. test:cov estável só com --maxWorkers=2. Rodapé e namespace mainLayout seguem para a #60.
