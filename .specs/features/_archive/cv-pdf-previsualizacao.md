# cv-pdf-previsualizacao

> Status: `implementada`
> Encerrada em: `2026-11-04`
> Commits: `feat/54-cv-pdf-previsualizacao` · PR: `—` · Issue: `#54`

## O que foi pedido

Entregar o PDF do currículo por idioma e ligar os quatro pontos de CV (Início, Informações, Contato e rodapé de Contato) a uma pré-visualização em modal, no lugar dos botões desativados e do link para um arquivo que não existia.

## O que foi feito

- O PDF sai de `npm run cv:pdf` (manual, fora do build), a partir dos `cv-<idioma>.md`: `react-markdown` gera o HTML de impressão com fontes de `public/fonts/` e o Chromium do Playwright grava o PDF marcado com `/Lang`. Os PDFs são versionados em `public/cv/`.
- O CI não gera PDF: `resumePdfsUpToDate.test.ts` regera em temporário e compara o texto extraído (não bytes) com o do PDF versionado. `pdfjs-dist` entrou só como devDependency de teste, e esses testes rodam em ambiente `node`.
- `ResumeLink` (`<a>` real para o PDF, clique simples abre o modal), `useResume` e `ResumeModal` (sobre o `Modal`, com `large`) atendem os quatro pontos; o `iframe` só aparece se `navigator.pdfViewerEnabled !== false` e os links "Baixar PDF" e "Ver versão em texto" ficam sempre visíveis. O `iframe` leva `oxlint-disable` de `iframe-missing-sandbox` porque o sandbox bloqueia o visualizador de PDF.
- A chave `resume.unavailableName` saiu dos três idiomas e `footer.resumeName` passou a "abre a pré-visualização".
- E2E em `e2e/resume.spec.ts` e specs antigos de Informações, Contato e sem JavaScript atualizados.

## Notas

- A aparência do PDF e do modal depende da revisão visual do PO.
- Esc dentro do visualizador de PDF é do visualizador (limitação de D52).
