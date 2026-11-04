# tela-contato

> Status: `implementada`
> Encerrada em: `2026-11-04`
> Commits: `origin/staging..feat/38-tela-contato` (inclui o merge de `origin/staging` com a #37) · PR: [#108](https://github.com/felipe-sant/portfolio-frontend/pull/108) · Issue: [#38](https://github.com/felipe-sant/portfolio-frontend/issues/38)

## O que foi pedido

O cabeçalho e o rodapé já apontavam para `/contact`, mas a rota não existia e caía na página não encontrada. A tela Contato precisava existir nos três idiomas, com os canais diretos do perfil e um formulário de mensagem que, sem backend na v1, ficasse pronto e desligado.

## O que foi feito

`Contact.page.tsx` (hook `useContact`) lê o perfil por RTK Query e mostra selo de disponibilidade, abertura, e-mail com copiar e `mailto:`, localização, tempo de resposta e "Baixar CV", com skeleton e `LoadError` com "Tentar novamente". Entraram a rota nos três prefixos, o namespace `contact` em `pt-BR`, `en` e `es`, a entrada no registro de pré-renderização, `PageMeta`, o JSON-LD `ContactPage` e os testes de unidade e E2E.

Decisões do PO: D40 (com a flag desligada o formulário não está no DOM, no HTML pré-renderizado nem no JS baixado), D41 (flag `VITE_CONTACT_FORM_ENABLED`, lida só em `src/utils/contactFormEnabled.ts`, só `"true"` liga, desligada em todo ambiente publicado até a #44) e D42 (campos e assuntos do formulário, com `RadioChipGroup` extraído do `ProjectsFiltersModal` e reaproveitado pelo assunto).

Decisões da spec:

- "Baixar CV" é `Button` `disabled` com nome `common:resume.unavailableName` até a #54; a chave é a mesma da #37, e a integração manteve uma só por idioma.
- Segundo build com a flag ligada (`npm run build:fatec:form`, `dist-form/`, porta 4174) para os projetos Playwright `contact-form-*`; os builds publicados continuam sem o formulário.
- `<Suspense fallback={null}>` local só em volta do `ContactForm` lazy, exceção à regra de página sem `Suspense` próprio, para o `lazy` não esconder a página inteira.
- O envio é uma mutation do RTK Query cujo `queryFn` chama `simulateContactSend` em `src/services/content/` (cerca de 1,4 s, sem requisição, nada persistido); a #44 troca por `query`.
- O contador de caracteres zerado usa a chave `_zero` com texto sem número nos três idiomas, e a fronteira de 60 restantes (aviso `aria-live`) tem teste próprio.
- `TextField` ganhou `inputRef`, `labelAddon` e `announceError`; só o formulário de Contato passa `announceError={false}`, porque o resumo de erros e o foco é que anunciam.

Integração com a #37 (`origin/staging`): conflitos em `resources`/`i18n.ts` (namespaces `about` e `contact`), `routes.tsx`, testes de rota, pré-renderização, `listTargets`, `routesUnderTest`, `navigation.spec.ts` e `.claude/CLAUDE.md`, resolvidos mantendo as duas metades. `/about` e `/contact` passam a existir e deixam de ser casos de não encontrada.

## Notas

Desvio: o pedido supunha Informações já existente; na época do planejamento ela ainda não existia na `staging`, e a ordem foi resolvida no merge. Ficam para depois: envio real, campo-isca no DOM, limite de taxa e aviso de LGPD (#44), o link real de CV (#54) e o conteúdo real do perfil (#58). Manual com o PO: aparência com a flag ligada (duas colunas a partir de 900px, tema escuro, 320px) e a conferência no Pages (#45). Atualização de `docs/screens/contact.md` quanto ao botão de CV desabilitado fica com o PO.
