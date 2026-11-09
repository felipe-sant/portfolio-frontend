# contato-demonstracao-flag-desligada

> Status: `implementada`
> Encerrada em: `2026-11-09`
> Commits: `8ba4e4b..HEAD` da branch `feat/158-contato-demonstracao-flag-desligada` · PR: — · Issue: #158

## O que foi pedido

O envio do formulário de Contato é simulado; se a flag `VITE_CONTACT_FORM_ENABLED` fosse ligada por engano num build publicado, quem preenche acharia que a mensagem chegou. Pedido: documentar que é demonstração, conferir a flag nos ambientes e travar o build publicado.

## O que foi feito

- `npm run check:contact-form [dir]` (`scripts/checkContactForm.ts` e `scripts/contactForm/findContactFormInBuild.ts`) reprova um build cujo HTML pré-renderizado tenha `id="contact-form"` ou a referência ao chunk `ContactForm`. Roda no job Build do `ci.yml`, no `fatec-pages.yml` (antes do upload) e nos dois jobs do `deploy.yml` (sobre `.vercel/output/static`); nunca sobre `dist-form/`.
- A spec previa um segundo sinal, o `ContactForm-*.js` referenciado por outro `.js`. A prova com builds reais mostrou que ele dá falso positivo: o chunk da página de Contato importa o `ContactForm` por `lazy` com a flag ligada ou desligada. Só o HTML distingue os dois estados, então o guard olha só HTML.
- Travas estáticas em `scripts/test/contactFormFlagGuard.test.ts` (nenhum workflow define a flag, `.env.example` com `false`, só `buildFatecForm.ts` liga, só `contactFormEnabled.ts` lê) e testes dos workflows em `scripts/test/contactFormGuardWorkflows.test.ts`.
- Documentação: aviso curto no `README.md`, `docs/screens/contact.md`, `docs/setup/environments.md`, `docs/setup/development.md` e `.claude/CLAUDE.md`.
- Prova: `build:fatec` mais o guard sobre `dist` sai 0; `build:fatec:form` mais o guard sobre `dist-form` sai 1 (6 achados, três idiomas); E2E `contact-form-desktop-light` com 41 testes verdes.

## Notas

- A conferência da flag na Vercel (production e preview) ficou pendente: o MCP da Vercel não estava disponível ao executor. O guard no `deploy.yml` cobre o caso mesmo assim.
