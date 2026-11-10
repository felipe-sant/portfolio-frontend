# capturas-e-foto-reais

> Status: `implementada`
> Encerrada em: `2026-11-10`
> Commits: `36663fb..9b879f9` · PR: `https://github.com/felipe-sant/portfolio-frontend/pull/213` · Issue: `https://github.com/felipe-sant/portfolio-frontend/issues/42`

## O que foi pedido

Fechar a D26 na v1: capturas reais nos projetos e foto de perfil real no lugar dos placeholders. As capturas já estavam em `staging` (#58); a foto de perfil ainda era um desenho em traço.

## O que foi feito

- A foto de perfil passou a ser a foto real (362 e 320 px, 1:1), gerada por `npm run profile:photo -- <jpeg>` com o Chromium do Playwright, sem dependência nova. O script recusa saída que não seja WebP.
- `validateImages` reprova blocos EXIF e XMP nos WebP e aceita ICC (NF-PR-05).
- O teste de conteúdo exige ao menos uma captura por projeto e a foto do perfil nos três idiomas (decisão do PO: sempre; D26, D48 e RF-PROJECT-04/05 ajustados).
- Testes do nome da foto em pt-BR, en e es e quatro E2E de imagem carregada sem placeholder.
- Documentação atualizada: D26 passou para `decidida`.

## Notas

- `npm run test:cov` não teve rodada limpa (falhas de `waitFor` sob carga que passaram isoladas); a cobertura não foi medida.
- A conferência no GitHub Pages fica com o PO depois do merge.
