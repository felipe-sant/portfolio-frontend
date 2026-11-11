# Tasks: 206-arquivos-para-ia-nos-tres-idiomas

> Spec: `./spec.md`

Trabalho só no worktree `/home/felipe/faculdade/portfolio/wt-206`. Estado vermelho nunca é commitado: cada tarefa é um commit, com o código, os testes que ela muda e os docs. O gate por tarefa é leve. `build`, `test:cov` e o E2E rodam só na T4. Nenhum comentário em código, teste ou exemplo. `scripts/seo/writeSeoFiles.ts` não é tocado em nenhuma tarefa (CA15).

## Plano de execução

```
T1 (#206) → T2 (#212) → T3 (#210) → T4 (verificação completa)
```

As tarefas são sequenciais porque editam os mesmos arquivos de teste, o mesmo E2E (`e2e/machine-files.spec.ts`) e os mesmos docs.

## Tarefas

- [ ] T1 — #206: `llms.txt` nos três idiomas, com descrições das chaves de tradução
    - **Arquivo(s):** `src/types/seo/SeoCommonLabels.types.ts` (campo `pageDescriptions: Record<"home" | "projects" | "about" | "contact", string>`, ou tipo próprio em `src/types/seo/` se ficar mais claro), `scripts/seo/readSeoContent.ts` (`readLabels` lê `meta.description` de `src/locales/<idioma>/{home,projects,about,contact}.json` por `readJson` e falha em português se faltar ou vier vazia), `scripts/seo/buildLlmsTxt.ts` (estrutura da seção "Estrutura do `llms.txt`" da spec; assinatura `buildLlmsTxt(content, origin, base)` igual), `scripts/test/buildLlmsTxt.test.ts`, `scripts/test/readSeoContent.test.ts`, `scripts/test/writeSeoFiles.test.ts`, `e2e/machine-files.spec.ts`, `docs/product/non-functional-requirements.md` (NF-IA-05: três idiomas, português como referência, estrutura), `docs/architecture/frontend.md` (trecho do `llms.txt` em "Arquivos para buscadores e IA" e a fonte `src/locales/<idioma>/{home,projects,about,contact}.json`)
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - borda: `meta.description` vazia em `contact.json` de um idioma faz `readSeoContent` falhar em português citando o arquivo (caso de borda da spec). `readSeoContent` ganha o parâmetro opcional `localesDirectory` com padrão `"src/locales"` (os chamadores, inclusive `writeSeoFiles.ts`, não mudam), e o teste usa uma cópia temporária de `src/locales`, em `scripts/test/readSeoContent.test.ts`
        - `readSeoContent("public")` traz `labels.pageDescriptions` dos quatro namespaces nos três idiomas, igual ao `meta.description` dos JSON (CA8), em `readSeoContent.test.ts`
        - abre com `# <authorName>` e `> <summary pt-BR>`, com um único `#` e um único `>` (CA1), em `buildLlmsTxt.test.ts`
        - os parágrafos `English: <summary en>` e `Español: <summary es>` vêm nessa ordem, antes do primeiro `##` (CA2), em `buildLlmsTxt.test.ts`
        - os `##` são exatamente os 12 esperados, montados a partir de `LLMS_LABELS` e `SUPPORTED_LANGUAGES` (sem lista literal de títulos no teste), na ordem e sem repetição (CA3), em `buildLlmsTxt.test.ts`
        - a seção de páginas de cada idioma tem as quatro linhas `- [navigation](url): meta.description` do idioma, na ordem Início, Projetos, Informações e Contato (CA4), em `buildLlmsTxt.test.ts`
        - a seção de projetos de cada idioma tem uma linha por projeto com título e resumo do idioma e a URL do idioma (CA5), em `buildLlmsTxt.test.ts`
        - a seção de CV e a de texto completo de cada idioma ligam só os arquivos daquele idioma (CA6), em `buildLlmsTxt.test.ts`
        - o conjunto de URLs é o de `expectedUrls()` e cada URL aparece exatamente uma vez (CA7), em `buildLlmsTxt.test.ts`. O teste "só aponta para URLs que existem no build" fica
        - sobre os arquivos gerados de verdade, o `llms.txt` contém os três `profile.summary` (CA15), em `writeSeoFiles.test.ts`
        - substituídos por estes: o `toEqual` dos quatro `##` em português, "lista cada projeto uma vez com o resumo pt-BR e os links en e es" e "não traz títulos de projeto traduzidos que diferem do pt-BR", que agora contradiz o comportamento. A Evidência registra a troca
        - E2E: o teste "NF-IA-05: llms.txt é servido em pt-BR no formato llmstxt.org" passa a se chamar "NF-IA-05: llms.txt é servido nos três idiomas no formato llmstxt.org" e afirma os três resumos (lidos de `public/content/<idioma>/profile.json` pelos helpers de `e2e/support/`) e 12 `##`. "NF-IA-05: llms.txt lista as páginas..." e "toda URL do llms.txt responde 200" seguem iguais (CA16), em `e2e/machine-files.spec.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/buildLlmsTxt.test.ts scripts/test/readSeoContent.test.ts scripts/test/writeSeoFiles.test.ts scripts/test/listSitemapEntries.test.ts`
    - **Feito quando:** o gate passa e cada teste listado tem asserção; `grep -nE '"(Início|Home|Inicio|Páginas|Pages)"' scripts/seo/buildLlmsTxt.ts` não retorna nada; `git diff --stat` não lista `scripts/seo/writeSeoFiles.ts`. Commit `Feat :sparkles: [#206] Publica o llms.txt em inglês e espanhol`. O E2E alterado roda na T4
    - **Evidência:** ...

- [ ] T2 — #212: e-mail trocado pelo link de Contato nos `llms-full*.txt`
    - **Arquivo(s):** `scripts/seo/buildLlmsFullTxt.ts` (`buildProfile` recebe idioma, origem e `base` e troca a linha do e-mail por `- <labels.navigation.contact>: <buildPageUrl(origin, base, ROUTES.contact, language)>`; `buildResume` aplica `content.resume.replaceAll(profile.contact.email, <URL de Contato do idioma>)`; assinatura `buildLlmsFullTxt(language, content, origin, base)` igual), `scripts/seo/llmsLabels.ts` e `src/types/seo/LlmsLabels.types.ts` (sai `email` nos três idiomas), `scripts/test/buildLlmsFullTxt.test.ts`, `scripts/test/buildLlmsTxt.test.ts`, `scripts/test/writeSeoFiles.test.ts`, `e2e/machine-files.spec.ts`, `docs/product/non-functional-requirements.md` (NF-IA-06: sem e-mail, link de Contato no lugar), `docs/architecture/frontend.md` (mesma nota no trecho dos `llms-full*.txt`), `docs/design/decisions.md` (decisão nova, próximo ID livre conferido com `grep -oE "^\| D[0-9]+" docs/design/decisions.md` na `origin/staging` atualizada: "E-mail fora dos arquivos para IA", Fonte `PO`, Data `11-11-2026`, Status `decidida`, Onde aplicar `scripts/seo/buildLlmsFullTxt.ts`, Issues `#212`; a página de Contato, o `profile.json` e os CV continuam com o e-mail)
    - **Depende de:** T1
    - **Testes (escritos antes, RED):**
        - borda: nenhum dos três `llms-full*.txt` contém `content[<qualquer idioma>].profile.contact.email` nem casa a regex de e-mail `/[A-Za-z0-9._+-]+@[A-Za-z0-9-]+\.[a-z]{2,}/` (TLD só com letras, para não confundir com versão de pacote como `react-dom@19.0.0`) (CA9), em `buildLlmsFullTxt.test.ts`
        - borda: com um `content` em que o currículo de um idioma traz o e-mail duas vezes, as duas viram a URL de Contato; com um currículo sem o e-mail, o texto embutido é o `.md` sem mudança (caso de borda da spec). Em `buildLlmsFullTxt.test.ts`, com cópia do `readSeoContent("public")` alterada em memória, sem fixture em disco
        - o perfil de cada idioma traz `- Contato: <URL /pt-BR/contact>`, `- Contact: <URL /en/contact>` e `- Contacto: <URL /es/contact>`, com o `base` da Fatec, montados de `labels.navigation.contact` e `buildSeoUrl` no teste (CA10), em `buildLlmsFullTxt.test.ts`
        - o currículo embutido é igual a `resume.trimEnd().replaceAll(email, contactUrl)` do idioma (CA11). Substitui a asserção `toContain(content[language].resume.trimEnd())` de "embute o currículo e liga o .md e o .pdf do idioma", em `buildLlmsFullTxt.test.ts`
        - o `llms.txt` não contém o e-mail de nenhum idioma (CA9), em `buildLlmsTxt.test.ts`
        - sobre os arquivos gerados de verdade, nenhum dos quatro `llms*.txt` casa a mesma regex de e-mail (CA15), em `writeSeoFiles.test.ts`
        - E2E: "NF-IA-06, NF-IA-07: cada llms-full está no idioma do arquivo..." passa a comparar com o currículo com o e-mail trocado pela URL `${ORIGIN}${FATEC_BASE_PATH}<idioma>/contact`, lendo o e-mail de `public/content/<idioma>/profile.json` por `e2e/support/`. Teste novo "NF-IA-06: nenhum llms*.txt traz o e-mail, e cada llms-full liga a Contato do idioma", com a mesma regex de e-mail (TLD só com letras) (CA16), em `e2e/machine-files.spec.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/buildLlmsFullTxt.test.ts scripts/test/buildLlmsTxt.test.ts scripts/test/writeSeoFiles.test.ts`
    - **Feito quando:** o gate passa e cada teste listado tem asserção; `grep -rnE "[A-Za-z0-9._+-]+@[A-Za-z0-9-]+\.[a-z]{2,}" scripts/seo` não retorna nada; `grep -rn "email" scripts/seo/llmsLabels.ts src/types/seo/LlmsLabels.types.ts` não retorna nada; `git diff --stat origin/staging` não lista `public/cv/`, `public/content/`, `src/pages/Contact.page.tsx` nem `scripts/seo/writeSeoFiles.ts` (CA12, CA15). Commit `Fix :bug: [#212] Troca o e-mail por link para Contato nos arquivos para IA`. O E2E alterado roda na T4
    - **Evidência:** ...

- [ ] T3 — #210: política de IA no `robots.txt` com `Content-Signal`
    - **Arquivo(s):** `scripts/seo/contentSignal.ts` (novo, `export default` da string `search=yes, ai-input=yes, ai-train=yes`, ao lado de `aiCrawlers.ts`), `scripts/seo/buildRobotsTxt.ts` (`buildGroup` passa a emitir `User-agent: <agente>\nAllow: /\nContent-Signal: <CONTENT_SIGNAL>\n`; assinatura `buildRobotsTxt(sitemapUrl)` igual), `scripts/test/buildRobotsTxt.test.ts`, `scripts/test/writeSeoFiles.test.ts`, `e2e/machine-files.spec.ts`, `docs/product/non-functional-requirements.md` (NF-IA-12: a política com a linha, a data 11-11-2026 e a nota de que o padrão é proposta, pode mudar e o Google informa que não age sobre ele), `docs/architecture/frontend.md` (trecho do `robots.txt`), `docs/design/decisions.md` (decisão nova com o próximo ID livre depois da T2: "Política de IA no `robots.txt`", Opções "sim/não para buscar, usar em respostas e treinar", Decisão "buscar sim, usar em respostas sim, treinar sim, por `Content-Signal` em todos os grupos", Fonte `PO`, Data `11-11-2026`, fonte da grafia com URL e data de acesso, Issues `#210`)
    - **Depende de:** T2
    - **Testes (escritos antes, RED):**
        - passo 0, antes do teste: conferir a grafia em https://contentsignals.org e anotar a URL e a data de acesso na Evidência. Se divergir de `Content-Signal: search=yes, ai-input=yes, ai-train=yes`, parar e devolver ao `sdd`. Sem acesso à rede, anotar "grafia não conferida na fonte" na Evidência e na linha da decisão e seguir; o Orc e o PO conferem antes do merge
        - borda: a linha aparece exatamente 12 vezes (`/^Content-Signal: /gm`), uma por grupo, e não há `=no` no arquivo (CA13), em `buildRobotsTxt.test.ts`
        - para `*` e cada crawler de `CRAWLERS`, o arquivo contém `User-agent: <agente>\nAllow: /\nContent-Signal: search=yes, ai-input=yes, ai-train=yes\n` (CA13), com `it.each`, em `buildRobotsTxt.test.ts`. A string esperada fica literal no teste, sem importar a constante
        - os testes existentes seguem verdes sem mudança: "libera todos os agentes", "tem um grupo próprio liberado para %s", "tem só o grupo curinga e os 11 crawlers" e "termina com o Sitemap absoluto e quebra de linha, sem Disallow" (CA13, CA14)
        - sobre o `robots.txt` gerado de verdade, a linha `Content-Signal` aparece 12 vezes (CA15), em `writeSeoFiles.test.ts`
        - E2E: teste novo "NF-IA-12: robots.txt declara a política de IA com Content-Signal em cada grupo" (CA16), em `e2e/machine-files.spec.ts`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run scripts/test/buildRobotsTxt.test.ts scripts/test/writeSeoFiles.test.ts`
    - **Feito quando:** o gate passa; a Evidência traz a fonte da grafia com a data de acesso; `git diff --stat origin/staging -- scripts/seo/writeSeoFiles.ts` vazio. Commit `Feat :sparkles: [#210] Declara a política de IA no robots.txt com Content-Signal`. O E2E roda na T4
    - **Evidência:** ...

- [ ] T4 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** T1, T2, T3
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run test:cov` (única rodada pesada) e, com `npm run build:fatec` feito, `npx playwright test e2e/machine-files.spec.ts --project=desktop-light`
    - **Feito quando:** o gate passa; CA1 a CA17 conferidos e anotados; `curl -s http://localhost:4173/ra2581392423047/llms.txt` (com `npm run preview:fatec`) mostra a estrutura da spec, e a leitura confere voz e ordem; `git diff --stat origin/staging -- scripts/seo/writeSeoFiles.ts` vazio; `.claude/CLAUDE.md` conferido (sem mudança esperada). Se o `test:cov` estourar por carga da máquina, rodar os arquivos isolados e anotar
    - **Evidência:** ...
