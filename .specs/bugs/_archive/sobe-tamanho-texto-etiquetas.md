# sobe-tamanho-texto-etiquetas

> Status: `implementada`
> Encerrada em: `2026-11-09`
> Commits: `fix/135-sobe-tamanho-texto-etiquetas` · PR: `—` · Issue: `#135`

## O que foi pedido

A revisão do site de 07/11/2026 apontou texto pequeno demais em etiquetas, datas e rótulos, embora o contraste passasse.

## O que foi feito

- `--text-chip` subiu de 11 px para 12 px (`--text-chip` e `--text-label-sm` continuam tokens separados, por decisão do PO); `docs/design/design-system.md` e `docs/design/prototype/tokens/typography.css` acompanham.
- Período da trajetória, ano do card de projeto e linha de detalhes (cargo) passaram a `--text-body-sm` (14 px), sem mexer em `--text-caption`, que o rodapé, a galeria, o modal e os campos continuam usando.
- `Chip` ganhou a prop `font` (`mono` padrão, `body`), usada só nos itens de "Como eu trabalho"; o título da coluna continua mono.
- Auditoria de `--text-caption` e `--text-label-sm`: os demais usos não são data nem cargo; os rótulos mono maiúsculos ficam em 12 px (decisão do PO) e as etiquetas de tecnologia de `projectStack` já estavam em 13 px, mantidas.
- Testes: leitura de CSS em `src/styles/test/`, `Chip` e `About`, e E2E de `getComputedStyle` e rolagem horizontal em `e2e/about.spec.ts` e `e2e/projects.spec.ts`.

## Notas

A verificação visual de CA4 (360, 390, 768 e 1280 px, nos dois temas) fica com o PO.
