# portfolio-frontend

## 1.1.1

### Patch Changes

- ff87ae6: Atualiza o perfil e a trajetória com testes automatizados, fluxo com agentes de IA, CI e novas disciplinas da Fatec, nos três idiomas. O corpo dos modais passa a receber foco pelo teclado, para que conteúdo longo possa ser rolado sem mouse.
- ff2cfd0: Poda os pesos de fonte: a faixa da Bricolage Grotesque passa a 600–800, o item ativo do menu mobile e a aba ativa de documentos usam pesos que têm arquivo, e um teste automatizado impede que fontes, `@font-face`, `preload` e tokens de peso voltem a divergir.

## 1.1.0

### Minor Changes

- 0dc73c4: Currículo em PDF por idioma com pré-visualização em modal nos quatro pontos de CV (Início, Informações, Contato e rodapé de Contato) e script manual `npm run cv:pdf` para gerar os PDFs a partir do Markdown.

### Patch Changes

- 8f79ed2: O modal do currículo mostra o PDF em celular e em navegadores sem visualizador de PDF, desenhando as páginas em canvas com o `pdfjs-dist` carregado só ao abrir o modal.

## 1.0.1

### Patch Changes

- 10374d9: Primeira versão publicada pelo fluxo automático de release.
