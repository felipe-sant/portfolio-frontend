# poda-pesos-fonte

> Status: `implementada`
> Encerrada em: `2026-11-07`
> Commits: `c9c3eb1..HEAD` · PR: `—` · Issue: `#40`

## O que foi pedido

Aplicar a poda de pesos de fonte (D08): remover o que não é usado de Bricolage Grotesque, IBM Plex Sans e IBM Plex Mono e impedir que arquivo, `@font-face`, `preload` e `--weight-*` divirjam.

## O que foi feito

O levantamento por família, com a herança resolvida, mostrou que todos os `woff2` e os cinco `--weight-*` estão em uso, então nenhum arquivo saiu. Dois pesos sem arquivo foram trocados na regra, por decisão do PO: Plex Mono 600 da aba ativa de documentos virou 500 e Plex Sans 800 do item ativo do menu mobile virou 700. A faixa da Bricolage passou de 400–800 para 600–800. Plex Sans 700 segue em uso implícito (`<strong>`, `<th>`). `scripts/test/fontWeights.test.ts` guarda a consistência, e `design-system.md` e D08 foram atualizados.

## Notas

`npm run test:e2e` tem 3 testes que já falham na `staging` (`projects-filters.spec.ts:366` e `:426`, `resume.spec.ts:367`), sem relação com fonte. Lacunas do teste (CA5, peso usado sem arquivo, `it.each` vazio, `process.cwd`) ficam para o `tester`.
