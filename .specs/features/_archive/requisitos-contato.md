# requisitos-contato

> Status: `implementada`
> Encerrada em: `2026-10-12`
> Commits: `b85b484..1410611` · PR: [#26](https://github.com/felipe-sant/portfolio-frontend/pull/26) · Issue: [#7](https://github.com/felipe-sant/portfolio-frontend/issues/7)

## O que foi pedido

A tela `/contact` é o fim da jornada do cliente e a issue da tela tinha como critério os requisitos de um documento que não existia. O comportamento estava espalhado entre D04, D05, D07, D14, D21, D25, D29, D32, D36 e a checklist de acessibilidade.

## O que foi feito

Criou `docs/screens/contact.md`, com IDs `RF-CONTACT-nn`, dizendo o que a tela mostra com a flag do formulário desligada (v1) e ligada (D25). A seção Validações traz a tabela campo, regra e mensagem nos três idiomas. Cobre o envio com erro (resumo em `role="alert"` e foco no primeiro campo inválido), o botão de envio com `aria-disabled` e `aria-busy`, a confirmação e a falha de envio.
