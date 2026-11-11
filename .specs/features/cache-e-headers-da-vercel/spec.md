# Spec: cache e headers da Vercel

> **Tipo:** `feature` <br />
> **Status:** `implementada` <br />
> **Issue:** `#194`, `#197`, `#163` <br />
> **Criado em:** `11-11-2026`

## Problema

Três achados da auditoria de SEO de 10/11/2026 e da revisão de código de 08/11/2026 (achado F2) tocam o `vercel.json`
e por isso saem num PR só (trilha F, decisão D-11 do PO):

- **#194:** tudo na Vercel sai com `cache-control: public, max-age=0, must-revalidate`. A cada visita repetida e a cada
  troca de idioma o navegador revalida uns 185 KB de JavaScript (brotli), o CSS, as fontes e as imagens.
- **#197:** a auditoria relatou que `/.well-known/rsl.xml` devolve o HTML do site com status 200.
- **#163:** a produção só devolve `strict-transport-security` (o da própria Vercel). Faltam `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors` e CSP.

Achados do planejamento, que mudam o que o PR precisa fazer:

1. **A `staging` descarta todos os headers do `vercel.json`.** O passo "Block indexing" do `deploy.yml` roda
   `jq '. + {headers: [...]}'`, que **substitui** a chave `headers` em vez de acrescentar a ela, e o teste
   `scripts/test/vercelConfig.test.ts` trava isso (`expect(staging.headers).toEqual(NOINDEX_HEADERS)`). Hoje a regra de
   `Content-Type` de `/cv/*.md` já não chega à `staging`; depois deste PR, cache, headers de segurança e CSP também não
   chegariam, e o ensaio da CSP na `staging` exigido pela D-11 seria impossível.
2. **O 200 da #197 não se reproduz.** Em 11/11/2026, `curl` na produção (`https://felipe-sant.vercel.app`) devolve 404
   (corpo do `404.html`, `text/html`) para `/.well-known/rsl.xml`, `/.well-known/security.txt`, `/xyz.xml`,
   `/en/xyz.png`, `/pt-BR/xyz.md`, `/assets/nope.js`, `/favicon.ico`, `/ads.txt` e `/projects`. A origem do 404 é a
   saída estática: sem `rewrites` nem `routes` no `vercel.json`, a Vercel serve o arquivo exato, o `<caminho>.html`
   (`cleanUrls`) ou, senão, o `404.html` da raiz do build com status 404. O fallback de SPA que devolvia `index.html`
   com 200 para qualquer caminho existiu no `vercel.json` de #15 (`e05ae6e`, 12/10) e saiu em #49 (`f97e214`, 24/10),
   antes da auditoria; a `main` já tinha essa configuração em 10/11. O 200 relatado é, com a evidência disponível, falso
   positivo da ferramenta (que recebeu HTML no corpo do 404). O ADR 0003 ainda descreve o fallback antigo
   ("`vercel.json` devolve `index.html` para qualquer caminho"), o que reforça a leitura errada.
3. **Só os 3 scripts inline do `index.html` são fixos.** Cada HTML pré-renderizado tem um quarto script inline, montado
   por `scripts/prerender/composePage.ts` (`window.prerenderedPath=...;window.preloadedState=...;window.routerData=...`),
   que muda por página e por conteúdo. Um `vercel.json` estático não consegue listar o hash de cada página, e
   `'unsafe-inline'` anularia a CSP. O JSON-LD (`<script type="application/ld+json">`) não é executado e não é afetado
   por `script-src`.
4. **As fontes não têm hash no nome** (`public/fonts/ibm-plex-sans-latin-400-normal.woff2` e afins), nem as imagens
   (`public/images/og-site.png`, `public/images/profile/photo-large.webp`, `public/images/projects/<id>/1-large.webp`).
   Os arquivos de `/assets` têm hash (gerados pelo Vite).

## Objetivo

- Na Vercel (produção e `staging`), `/assets/*` e `/fonts/*` saem com `public, max-age=31536000, immutable` e
  `/images/*` com `max-age` longo sem `immutable`; HTML, `sitemap.xml`, `robots.txt`, `llms.txt` e o resto continuam com
  o padrão da Vercel.
- A `staging` recebe exatamente os headers da produção, mais o `X-Robots-Tag: noindex`.
- Caminho inexistente, com ou sem extensão, continua respondendo 404 com a não encontrada, e um teste impede a volta de
  qualquer reescrita ou rota no `vercel.json`.
- Headers sem risco ativos em todo caminho e uma CSP completa em `Content-Security-Policy-Report-Only`, com o hash
  `sha256` dos 3 scripts inline do `index.html`, conferido por teste contra o `index.html`.
- O HTML pré-renderizado deixa de ter script inline executável próprio: os dados da página vão num bloco
  `<script type="application/json">`, que a CSP não governa.
- A documentação diz que nada disso vale no build da Fatec (GitHub Pages), que não recebe `vercel.json` (NF-HO-04).

## Fora de escopo

- Tornar a CSP obrigatória (trocar `Report-Only` por `Content-Security-Policy`): fica para issue nova, depois do ensaio
  na `staging` e da limpeza do que ele reportar.
- Endpoint de relatório da CSP (`report-uri`/`report-to`): não há backend (R1) e um coletor de terceiros violaria
  NF-PR-01. O ensaio é pelo console do DevTools.
- Cache longo para `/content/*` (JSON de conteúdo), `/cv/*` (PDF e Markdown) e `/favicon.svg`: sem hash no nome e
  trocados a cada conteúdo novo, ficam no padrão da Vercel.
- Qualquer regra que devolva 404 por padrão de caminho (por exemplo "caminho com extensão"): quebraria
  `/<idioma>/projects/<id>/docs/SETUP.md` (servido de `SETUP.md.html` pelo `cleanUrls`) e `/cv/*.md`.
- `/404` respondendo 200 com a não encontrada (o `404.html` servido pelo `cleanUrls`): é soft-404 com
  `<meta name="robots" content="noindex">`, não está no critério da #197 e não tem correção sem `routes`. Registrado em
  "Questões em aberto".
- O painel da Vercel (critério "conferir no painel" da #163): a auditoria de 10/11 mostrou que `/en` só devolve
  `strict-transport-security`, então não há header configurado lá (D-11).
- Build da Fatec: nenhum arquivo do Pages muda por causa das regras; só o código do cliente da tarefa T4, que é igual
  nos dois builds.
- Não tem tela: não há texto de UI novo (R2 não se aplica) nem verificação visual; o `qa` só confere por `curl` e
  console.

## Critérios de aceite

IDs novos propostos para `docs/product/non-functional-requirements.md`: **NF-HO-07** (cache na Vercel) e **NF-HO-08**
(headers de segurança e CSP na Vercel). Os demais citados já existem: NF-HO-02, NF-HO-04, NF-IA-03, NF-IA-04, NF-PR-01.

**Staging (pré-requisito das três)**

- [x] CA-01 (NF-HO-07, NF-HO-08): a expressão `jq` do job `staging` do `deploy.yml` acrescenta o `X-Robots-Tag:
noindex` ao fim de `headers` sem descartar nenhuma regra; aplicada ao `vercel.json`, o resultado mantém
      `cleanUrls`, `trailingSlash` e todas as regras de `headers` do arquivo, na mesma ordem, mais a regra de `noindex`.
      Teste: `scripts/test/vercelConfig.test.ts`.

**#194 — cache**

- [x] CA-02 (NF-HO-07): a regra de `source` `/assets/(.*)` define `Cache-Control: public, max-age=31536000, immutable`.
- [x] CA-03 (NF-HO-07): a regra de `source` `/fonts/(.*)` define `Cache-Control: public, max-age=31536000, immutable`
      (ver Q-1).
- [x] CA-04 (NF-HO-07): a regra de `source` `/images/(.*)` define `Cache-Control: public, max-age=2592000`, sem
      `immutable` (ver Q-2).
- [x] CA-05 (NF-HO-07): só essas três regras definem `Cache-Control`; nenhuma outra regra do `vercel.json` (inclusive
      a de `/(.*)` dos headers de segurança) define `Cache-Control`, então HTML, `sitemap.xml`, `robots.txt`, `llms.txt`,
      `llms-full*.txt`, `/content/*` e `/cv/*` ficam no padrão da Vercel. Teste de CA-02 a CA-05:
      `scripts/test/vercelConfig.test.ts`.

**#197 — 404 para caminho inexistente**

- [x] CA-06 (NF-HO-02, NF-IA-04): o `vercel.json` não tem `rewrites` nem `routes` (nenhuma, não só a genérica). Teste:
      `scripts/test/vercelConfig.test.ts`.
- [x] CA-07 (NF-IA-04): no resolvedor que reproduz o Pages, `.well-known/rsl.xml` e um caminho de arquivo com extensão
      desconhecida (`xyz.xml`) respondem 404 com o `404.html`. Teste: `scripts/test/resolvePagesFile.test.ts`.
- [x] CA-08 (NF-IA-04): o ADR 0003 deixa de dizer que o `vercel.json` devolve `index.html` para qualquer caminho e
      descreve o 404 pelo `404.html` (revisão do `reviewer`).
- [ ] CA-09 (NF-IA-04): na `staging`, depois do merge, `curl` com o bypass de automação em `/.well-known/rsl.xml`,
      `/xyz.xml` e `/projects` devolve 404, e `/pt-BR`, `/en/projects` e `/pt-BR/projects/<id>/docs/<nome>.md` devolvem
      200 (ensaio do `qa`, ver "Estratégia de validação").

**#163 — dados da pré-renderização fora de script executável**

- [x] CA-10 (NF-HO-08, NF-IA-03): a página que `composePage` monta não tem nenhum `<script>` inline executável (sem
      `src` e sem `type`, ou com `type` de JavaScript) além dos que já estão no molde; os dados da página
      (`path`, `state`, `routerData`) vão num único `<script type="application/json" id="prerender-data">` depois de
      `#root`, com `<` escapado como `<`. Teste: `scripts/test/composePage.test.ts`.
- [x] CA-11 (NF-IA-03): uma função pura lê esse bloco do `document` e devolve `path`, `state` e `routerData`; devolve
      `undefined` quando o bloco não existe ou está vazio (raiz `/`, que serve o `index.html` sem bloco). Teste:
      `src/utils/test/readPrerenderData.test.ts`.
- [x] CA-12 (NF-IA-03): o cliente hidrata com o estado e os dados do roteador lidos do bloco quando o caminho aberto é o
      `path` do bloco, e usa `createRoot` sem estado quando não é ou quando não há bloco, como hoje com
      `window.prerenderedPath`. Os globais `window.prerenderedPath`, `window.preloadedState` e `window.routerData` deixam
      de existir. Teste: `src/prerender/test/mountClient.test.tsx`.

**#163 — headers e CSP**

- [x] CA-13 (NF-HO-08): uma regra de `source` `/(.*)` define `X-Content-Type-Options: nosniff`,
      `Referrer-Policy: strict-origin-when-cross-origin`,
      `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()`,
      `X-Frame-Options: SAMEORIGIN` e `Content-Security-Policy: frame-ancestors 'self'` (obrigatória: `frame-ancestors`
      é ignorado dentro de `Report-Only`). `SAMEORIGIN`/`'self'`, e não `DENY`/`'none'`, porque o modal do CV
      (`src/components/ResumeModal.tsx`) abre o PDF da própria origem num `<iframe>`.
- [x] CA-14 (NF-HO-08): a mesma regra define `Content-Security-Policy-Report-Only` com
      `default-src 'self'; script-src 'self' <hashes>; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;
font-src 'self'; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'`.
- [x] CA-15 (NF-HO-08): os `<hashes>` de `script-src` são exatamente os `sha256-<base64>` do conteúdo de cada
      `<script>` inline sem `type` do `index.html`, com `%BASE_URL%` trocado por `/` (o `base` da Vercel). Um script
      inline acrescentado, removido ou reformatado no `index.html` sem atualizar o `vercel.json` falha o teste.
      Teste de CA-13 a CA-15: `scripts/test/vercelConfig.test.ts`.
- [ ] CA-16 (NF-HO-08): na `staging`, depois do merge, `curl -sI` com o bypass em `/en`, `/assets/<um arquivo>` e
      `/fonts/ibm-plex-sans-latin-400-normal.woff2` mostra os headers de CA-02, CA-03, CA-13 e CA-14 mais o `noindex`, e
      o modal do CV mostra o PDF, e o console do DevTools em `/`, `/pt-BR`, um projeto, um documento Markdown com código
      e o CV em PDF não mostra
      violação da CSP vinda do site além das esperadas listadas em "Riscos" (ensaio do `qa`).

**Nas três — documentação**

- [x] CA-17 (NF-HO-04): `docs/setup/environments.md`, `docs/adr/0003-hosting-vercel.md`,
      `docs/architecture/frontend.md` e `docs/product/non-functional-requirements.md` dizem que cache, headers de
      segurança e CSP vêm do `vercel.json`, valem só na Vercel e não chegam ao build da Fatec (GitHub Pages não lê
      `vercel.json` nem permite header próprio); `docs/adr/0004-prerendering.md` e `docs/architecture/frontend.md`
      descrevem o bloco `prerender-data` no lugar dos globais `window.*` (revisão do `reviewer`).

## Estratégia de validação

- **Checagens automatizadas:** `scripts/test/vercelConfig.test.ts` (CA-01 a CA-06, CA-13 a CA-15),
  `scripts/test/resolvePagesFile.test.ts` (CA-07), `scripts/test/composePage.test.ts` (CA-10),
  `src/utils/test/readPrerenderData.test.ts` (CA-11), `src/prerender/test/mountClient.test.tsx` (CA-12). A hidratação
  no build é coberta pelos E2E existentes, que rodam no CI sobre o `build:fatec` (`e2e/no-javascript.spec.ts`,
  `e2e/home.spec.ts`, `e2e/project-documents.spec.ts`, `e2e/not-found.spec.ts`).
- **Checagens manuais (ensaio na `staging`, `qa`, depois do merge):** a `staging` tem Vercel Authentication; use o
  bypass de automação (`x-vercel-protection-bypass`), como em `docs/setup/environments.md`.
    - `curl -sI -H "x-vercel-protection-bypass: <segredo>" <beta>/en` (CA-13, CA-14, `noindex`, `Cache-Control` padrão);
      o mesmo em `/assets/<arquivo do HTML>` (CA-02), `/fonts/ibm-plex-sans-latin-400-normal.woff2` (CA-03),
      `/images/og-site.png` (CA-04), `/sitemap.xml`, `/robots.txt`, `/llms.txt` (CA-05).
    - `curl -s -o /dev/null -w "%{http_code}\n"` com o bypass nos caminhos de CA-09.
    - Navegador logado na Vercel, DevTools > Console, com o cache desligado: `/`, `/pt-BR`, `/en/projects`, um projeto,
      um documento Markdown com bloco de código e a abertura do CV em PDF (CA-16). Anotar cada violação
      `[Report Only]` com a diretiva.
- **Rollback / mitigação:** a CSP não bloqueia nada (`Report-Only`); se um header sem risco quebrar algo, reverter o
  commit `Build :rocket: [#163]` no `vercel.json`. Se o cache longo de `/images` servir imagem velha, trocar o nome do
  arquivo ou baixar o `max-age`.

## Riscos

- **Violações esperadas no ensaio, que não são do site:** a `staging` é um deployment de preview e a Vercel injeta a
  barra de ferramentas (`vercel.live`), que gera relatórios de `script-src`, `connect-src` e `frame-src` que a
  produção não terá. O `qa` não deve tratá-los como bug.
- **Modal do CV:** o `<iframe>` do PDF depende de `frame-ancestors 'self'`/`SAMEORIGIN` (CA-13) e o próprio PDF passa
  a sair com a CSP em `Report-Only` (`object-src 'none'` vale para a resposta do PDF); o ensaio abre o modal e confere
  que o PDF aparece.
- **Violações esperadas do pdf.js** ao abrir o CV: `unsafe-eval` (o pdf.js testa `new Function` para fontes) e,
  talvez, `worker-src`/`blob:`. Em `Report-Only` nada quebra; a issue que tornar a CSP obrigatória decide entre
  `isEvalSupported: false` e ajustar a diretiva.
- **`immutable` em fonte sem hash (Q-1):** se um `.woff2` mudar sem trocar de nome, quem já visitou fica com a fonte
  antiga por até um ano. Mitigação: regra documentada de que fonte trocada muda de nome.
- **`Cache-Control` em 404 sob `/assets`:** a Vercel aplica a regra de header também à resposta 404 (hoje
  `/cv/x.md` 404 sai com `Content-Type: text/markdown`), então um asset inexistente responderia 404 com `immutable`.
  Risco baixo: o nome tem hash e não é reaproveitado.
- **Mudança no cliente vai para a Fatec:** a tarefa T4 muda como o cliente lê os dados da pré-renderização, código que
  entra no próximo build 1.x do Pages antes de 22/11. Rede de proteção: testes de unidade de `mountClient`,
  `composePage` e os E2E de hidratação e sem JavaScript no CI. Ver Q-3.
- **Prettier no `index.html`:** reformatar um script inline muda o hash; o teste de CA-15 pega isso no CI.

## Questões em aberto

**Respondidas pelo PO em 11-11-2026 (registradas pelo Orc), com a spec aprovada:** Q-1 sim (`immutable` nas fontes); Q-2
sim (30 dias em `/images`); Q-3 sim (T4 entra e o changeset é `patch`); Q-4 sim (`Test :test_tube: [#197]`); Q-5 fora
desta spec, em issue própria aberta pelo PO.

- **Q-1 (PO): fontes sem hash com `immutable` por um ano?** Recomendação: sim, como a #194 pede, com a regra
  documentada "fonte trocada muda de nome" (as fontes vêm do Fontsource e mudam raramente). Alternativa: tratar
  `/fonts/*` como `/images/*` (30 dias sem `immutable`).
- **Q-2 (PO): `max-age` de `/images/*`.** Recomendação: 30 dias (`2592000`) sem `immutable`, porque a foto de perfil, a
  imagem de Open Graph e as capturas de projeto são regeradas com o mesmo nome. Quanto mais longo, mais tempo um
  visitante recorrente vê a imagem antiga.
- **Q-3 (PO): aceitar mudar o bootstrap do cliente (T4) num PR que era só da Vercel, sabendo que ele entra no build da
  Fatec?** Recomendação: sim. É a única forma de a CSP com hash cobrir as páginas pré-renderizadas (ver "Notas"); o
  comportamento visível não muda e os E2E de hidratação seguram. Consequência: o **changeset deixa de ser vazio e vira
  `patch`**, ao contrário da sugestão da trilha F, porque o código publicado no Pages muda. Se o PO recusar, T4 sai do
  PR, a CSP fica igual (só os 3 hashes) e o ensaio vai reportar sempre o script de dados de cada página
  pré-renderizada; a CSP não poderia virar obrigatória sem voltar a esta mudança.
- **Q-4 (Orc): tipo do commit da #197.** Como o 404 já funciona e o PR só acrescenta testes e corrige o ADR, o commit
  sugerido é `Test :test_tube: [#197] ...` em vez de `Fix :bug: [#197] ...`. A issue fecha com a evidência do `curl`
  na descrição do PR.
- **Q-5 (PO, sem bloquear): `/404` responde 200.** O `404.html` fica acessível em `/404` com status 200 pelo
  `cleanUrls`. Tem `noindex` e não é linkado. Recomendação: não tratar agora; abrir issue só se aparecer em relatório de
  buscador.

## Notas / decisões

- **Por que mover os dados para `application/json`:** CSP só governa script que executa; um bloco
  `<script type="application/json">` é bloco de dados, não é executado nem bloqueado, como o JSON-LD. Alternativas
  descartadas: um hash por página no `vercel.json` (centenas de regras geradas no deploy, frágil e perto do limite de
  rotas da Vercel); nonce (exige servidor por requisição, o site é estático); `'unsafe-inline'` em `script-src` (anula
  a CSP e é ignorado quando há hash); CSP só com os 3 hashes e o quarto script reportado sempre (o ensaio nunca ficaria
  limpo).
- **Hashes atuais**, conferidos em 11/11/2026 contra o HTML de produção (`/` e `/en`), iguais aos calculados do
  `index.html` com `%BASE_URL%` = `/`: `sha256-Lp5MUOIsEyVFwrV1bg2Ebc1oUibRdN5xq073541NvL4=` (redirecionamento por
  idioma), `sha256-4pOTQgkXH3S4PNnYzS86IxTDxYSnsQgKtpKjp2pQyeI=` (tema),
  `sha256-59dl/7UczLxM+hfItgoO0DLIEOdZP0iaWO9dMT8xkqQ=` (movimento). O teste é a fonte da verdade; estes valores só
  ajudam a conferir. No build da Fatec o `%BASE_URL%` é `/ra2581392423047/` e o primeiro hash seria outro, mas o Pages
  não recebe header.
- **`style-src 'unsafe-inline'`:** o HTML pré-renderizado e o React escrevem atributo `style` (por exemplo
  `style="opacity:0"`), que hash não cobre.
- **`frame-ancestors` obrigatório e o resto em `Report-Only`:** enviar `Content-Security-Policy` só com
  `frame-ancestors 'self'` junto da `Content-Security-Policy-Report-Only` é válido; o navegador aplica a primeira e só
  relata a segunda. `X-Frame-Options: SAMEORIGIN` cobre navegador antigo. Conferido em 11/11/2026
  (`grep -rn "<iframe\|<object\|<embed" src`): o único quadro é o `<iframe>` do PDF em `ResumeModal.tsx`, da própria
  origem; `DENY`/`'none'` quebraria o modal do CV na Vercel.
- **Ordem das regras:** a Vercel aplica todas as regras de `headers` cujo `source` casa; nenhuma chave se repete entre
  as regras deste PR, então a ordem não muda o resultado. A regra de `noindex` da `staging` entra por último.
- **Changeset:** `patch` se Q-3 for aceita (cliente muda no Pages); vazio só se T4 sair do PR.
- **Dependência nova:** nenhuma.
