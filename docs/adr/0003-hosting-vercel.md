# 0003. Hospedagem na Vercel

- **Status:** `aceita`
- **Data:** `11-10-2026`

## Contexto

A aplicação só tinha CI: não havia hospedagem nem pipeline de publicação. A v1 da Fatec tem trilha própria, no GitHub Pages de um repositório da organização da Fatec (#45, #63). O PO quer, em paralelo e fora do critério da v1, um ambiente de testes e uma produção pessoal publicados a cada push, sem depender do repositório da faculdade. Backend e AWS só chegam na V2+ (#46).

## Decisão

- Hospedar na Vercel, num projeto só: a `main` é o deployment de produção (`felipe-sant.vercel.app`) e a `staging` é um deployment de teste (preview) com alias (`felipe-sant-beta.vercel.app`), protegido por Vercel Authentication e marcado com `X-Robots-Tag: noindex`.
- Publicar por GitHub Actions com a Vercel CLI (`.github/workflows/deploy.yml`), disparado por `workflow_run` do CI concluído com sucesso em push na `main` ou na `staging`. A integração Git nativa da Vercel fica desligada.
- Migrar para AWS na V2+, quando houver backend, por ADR própria na migração (#46).

## Consequências

- Só publica com build, lint e testes verdes: CI falhando, cancelado ou vindo de PR não gera deploy.
- O `deploy.yml` roda a partir do arquivo da branch padrão (`staging`), então o primeiro deploy de produção só acontece depois da primeira promoção `staging` -> `main`.
- Credenciais da Vercel (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) ficam em GitHub Secrets e as variáveis de build em GitHub Environments (`production`, `staging`).
- Desde #49 o `vercel.json` não tem `rewrites` nem `routes`: a Vercel serve o arquivo exato, o `<caminho>.html` (`cleanUrls`) ou, se nenhum existir, o `404.html` da raiz do build com status 404. As rotas internas recarregam sem 404 porque cada uma tem HTML pré-renderizado (ADR 0004), e caminho inexistente, com ou sem extensão (como `/.well-known/rsl.xml`), responde 404 com a não encontrada. O fallback antigo que devolvia `index.html` com 200 para qualquer caminho (#15) saiu em #49, e `scripts/test/vercelConfig.test.ts` impede a volta de qualquer reescrita ou rota.
- Cache, headers de segurança e CSP vivem no `vercel.json` (#194, #163) e só valem na Vercel: `/assets` e `/fonts` com `public, max-age=31536000, immutable`, `/images` com 30 dias, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: SAMEORIGIN`, `frame-ancestors 'self'` e a CSP em `Report-Only`. O build da Fatec não recebe nada disso, porque o GitHub Pages não lê `vercel.json` nem permite header próprio (NF-HO-04). A `staging` recebe os mesmos headers mais o `noindex`, que o `deploy.yml` acrescenta ao fim de `headers`.
- A versão da Vercel CLI é fixada no workflow e atualizada à mão.
- O beta não é visível para terceiros sem login Vercel, o que impede mostrá-lo ou checá-lo por `curl` sem o bypass de automação.

## Alternativas

- **Integração Git nativa da Vercel:** publica a cada push independentemente do CI, o que quebra a regra de só publicar com o CI verde.
- **GitHub Pages:** já é o destino da v1 da Fatec, mas não tem deployment de teste com alias nem protegido, e não atende à trilha pessoal fora do repositório da organização.
- **AWS já:** exige backend e infraestrutura que ainda não existem, com custo e esforço sem ganho antes da V2+.
