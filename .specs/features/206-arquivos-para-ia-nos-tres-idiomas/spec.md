# Spec: 206-arquivos-para-ia-nos-tres-idiomas

> **Tipo:** `feature` (trilha G: #206, #212 e #210 num PR só) <br />
> **Status:** `em-andamento` <br />
> **Issue:** `#206`, `#212`, `#210` <br />
> **Criado em:** `11-11-2026`

Sem tela: a mudança é só nos arquivos gerados pelo build (`llms.txt`, `llms-full.txt`, `llms-full.en.txt`, `llms-full.es.txt` e `robots.txt`). O `qa` se aplica só ao E2E `e2e/machine-files.spec.ts`; não há verificação visual. Base: `origin/staging` em `6c10b34`.

## Problema

Origem: auditoria de SEO do claude-seo em felipe-sant.vercel.app, 10-11-2026.

1. **#206.** O `llms.txt` está só em português (NF-IA-05): o `>` traz o resumo `pt-BR`, as páginas e os projetos aparecem com o nome e o resumo em português, e os outros idiomas são só links. O site tem três idiomas e os `llms-full*.txt` já existem por idioma, mas o arquivo de entrada não descreve nada em inglês nem em espanhol.
2. **#212.** O endereço de e-mail aparece em texto puro nos três `llms-full*.txt`, em dois lugares: a linha "E-mail" do perfil (`buildProfile` em `scripts/seo/buildLlmsFullTxt.ts`) e a linha 4 do currículo embutido (`public/cv/cv-<idioma>.md`, embutido inteiro por `buildResume`). Um arquivo feito para leitura por máquina é um lugar fácil para coletores de spam.
3. **#210.** O `robots.txt` libera todos os robôs (o grupo `*` e os 11 crawlers de IA de NF-IA-12), mas não diz o que a IA pode fazer com o conteúdo. O `Content-Signal` é a forma proposta de dizer isso (buscar, usar em respostas, treinar).

## Decisões do PO (11-11-2026)

Registradas pelo Orc como "D-04" e "D-14". Não confundir com `D04` (rodapé) e `D14` (CV) de `docs/design/decisions.md`: esta spec não usa esses nomes e registra as duas decisões com IDs novos (T2 e T3).

- **E-mail fora dos arquivos para IA (#212):** no `llms.txt` e nos `llms-full*.txt`, o endereço de e-mail é trocado por um link para a página de Contato do idioma do arquivo, nos três idiomas. A página de Contato continua mostrando o e-mail e não muda.
- **Política de IA (#210):** buscar sim, usar em respostas sim, treinar sim. O `robots.txt` emite `Content-Signal: search=yes, ai-input=yes, ai-train=yes` em todos os grupos. A decisão entra em `docs/` com a data, porque o padrão é uma proposta e pode mudar.
- **#206:** o `llms.txt` traz o resumo e as descrições nos três idiomas, com o português como referência, sem texto escrito à mão no gerador.

## Objetivo

1. O `llms.txt` descreve o portfólio em `pt-BR`, `en` e `es`: resumo profissional nos três idiomas e, por idioma, as quatro páginas com a descrição da página, os projetos com título e resumo do idioma, o CV e o texto completo. O formato continua o de llmstxt.org (NF-IA-05).
2. Nenhum dos quatro arquivos `llms*.txt` contém o endereço de e-mail. No lugar dele aparece o link para `/<idioma>/contact`, com a mesma origem e o mesmo `base` das outras URLs (NF-IA-06).
3. Cada grupo do `robots.txt` declara a política de IA com `Content-Signal`, sem mudar a liberação atual (NF-IA-12).
4. `scripts/seo/writeSeoFiles.ts` não muda. A trilha H (#202 e #207) mexe nele depois, e toda a lógica fica nos construtores (`build*.ts`), em `readSeoContent.ts` e nos rótulos.

## Fora de escopo

- Página de Contato, `profile.json`, `public/cv/cv-*.md` e `cv-*.pdf`: o e-mail continua neles. O `.md` público do CV, ligado pelo `llms.txt`, segue com o e-mail (ver "Questões em aberto").
- Novos arquivos `llms.en.txt` e `llms.es.txt`: mudariam `writeSeoFiles.ts` e a regra de "exatamente seis arquivos" (ver "Notas / decisões").
- O texto jurídico que o Content Signals Policy sugere em comentário `#` no topo do `robots.txt`. Seria texto em inglês, escrito à mão e sem tradução, e não é necessário para a linha valer.
- Migrar `scripts/seo/llmsLabels.ts` (vocabulário das seções, da #51) para `src/locales/`.
- `sitemap.xml`, JSON-LD, metadados das páginas, `index.html`, o mecanismo de `noindex` da staging e backend (R1).
- Changeset: fica com o Dev no passo do PR, depois da liberação do Orc.

## Estrutura do `llms.txt` (#206)

O formato de llmstxt.org admite um único `#` (nome), um único `>` (resumo), parágrafos livres sem título depois dele e seções `##` com listas de links `- [nome](url): notas`. A estrutura escolhida:

```
# Luiz Felipe dos Santos

> <profile.summary de pt-BR>

English: <profile.summary de en>

Español: <profile.summary de es>

## Páginas (Português)

- [Início](<origem>/pt-BR): <home:meta.description de pt-BR>
- [Projetos](<origem>/pt-BR/projects): <projects:meta.description de pt-BR>
- [Informações](<origem>/pt-BR/about): <about:meta.description de pt-BR>
- [Contato](<origem>/pt-BR/contact): <contact:meta.description de pt-BR>

## Projetos (Português)

- [<título pt-BR>](<origem>/pt-BR/projects/<id>): <resumo pt-BR>

## Currículo (Português)

- [Currículo em Markdown](<origem>/cv/cv-pt-BR.md)
- [Currículo em PDF](<origem>/cv/cv-pt-BR.pdf)

## Texto completo (Português)

- [Texto completo do site](<origem>/llms-full.txt)

## Pages (English)

...as mesmas quatro seções em en, e depois em es
```

Por que essa estrutura:

- **Um arquivo só.** Mantém o `llms.txt` como único ponto de entrada da convenção (crawler não procura `llms.en.txt`) e não muda `writeSeoFiles.ts` nem a lista de arquivos do build.
- **O português como referência.** O `>` é o resumo `pt-BR` e as seções do português vêm primeiro. Os resumos `en` e `es` vêm logo abaixo, em parágrafos sem título que começam pelo nome do idioma (`LLMS_LABELS[idioma].languageName`), como o formato permite.
- **Seções por idioma, cada uma com o idioma no título.** Em `pt-BR` e `es`, "Páginas" e "Texto completo" são iguais; o sufixo `(<languageName>)` evita `##` repetido e segue o padrão de parênteses que o gerador já usa nos links. São 12 seções `##`, todas diferentes, na ordem de `SUPPORTED_LANGUAGES`.
- **Cada URL aparece uma vez.** Toda URL de página, de projeto, de CV e de texto completo aparece numa única linha, na seção do próprio idioma. O título e o resumo do link também são do idioma, e os links de idioma entre parênteses deixam de existir.

De onde vem cada texto (nada escrito à mão no construtor):

| Texto                                                               | Fonte                                                                                                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Nome (`#`)                                                          | `common:authorName` de `src/locales/pt-BR/common.json` (já é assim)                                                                  |
| Resumos                                                             | `profile.summary` de `public/content/<idioma>/profile.json`, a camada de conteúdo (R1), como já é hoje no `>` e nos `llms-full*.txt` |
| Nome da página                                                      | `common:navigation.<página>` de `src/locales/<idioma>/common.json` (já é assim)                                                      |
| Descrição da página                                                 | `<página>:meta.description` de `src/locales/<idioma>/{home,projects,about,contact}.json`, lido por `readSeoContent`                  |
| Título e resumo do projeto                                          | `public/content/<idioma>/projects.json`                                                                                              |
| Títulos de seção, rótulos de CV e de texto completo, nome do idioma | `LLMS_LABELS` de `scripts/seo/llmsLabels.ts` (vocabulário da #51, nos três idiomas, sem chave nova)                                  |

## Critérios de aceite

`llms.txt` (#206, NF-IA-05)

- [x] **CA1** — O `llms.txt` abre com `# <authorName>`, uma linha em branco e `> <profile.summary pt-BR>`, e tem um único `#` e um único `>`.
- [x] **CA2** — Logo depois do `>`, antes do primeiro `##`, vêm dois parágrafos, `English: <summary en>` e `Español: <summary es>`, nessa ordem.
- [x] **CA3** — As seções `##` são exatamente as 12 de `[pages, projects, resume, fullText] × [pt-BR, en, es]`, no formato `## <rótulo do idioma> (<languageName do idioma>)`, agrupadas por idioma na ordem `pt-BR`, `en`, `es`. Nenhum `##` se repete.
- [x] **CA4** — Na seção de páginas de cada idioma, as quatro linhas são `- [<navigation.<página> do idioma>](<URL /<idioma><rota>>): <<página>:meta.description do idioma>`, na ordem Início, Projetos, Informações e Contato.
- [x] **CA5** — Na seção de projetos de cada idioma, há uma linha por projeto de `content[<idioma>].projects`, na ordem do conteúdo: `- [<título do idioma>](<URL /<idioma>/projects/<id>>): <resumo do idioma>`.
- [x] **CA6** — Na seção de CV de cada idioma estão o `.md` e o `.pdf` daquele idioma; na seção de texto completo, o `llms-full*.txt` daquele idioma (`getLlmsFullFileName`).
- [x] **CA7** — O conjunto de URLs ligadas é o mesmo de hoje: as quatro páginas e cada projeto nos três idiomas, os seis CV e os três textos completos. Cada uma aparece exatamente uma vez, e nenhuma aponta para fora do que o build gera (o teste "todo link do llms.txt é um loc do sitemap ou um arquivo gerado" segue verde).
- [x] **CA8** — `readSeoContent` lê `meta.description` de `home`, `projects`, `about` e `contact` nos três idiomas. Nenhum texto de resumo, descrição, nome de página ou título de projeto está escrito em `buildLlmsTxt.ts`.

E-mail (#212, NF-IA-06)

- [x] **CA9** — Nenhum dos quatro `llms*.txt` contém `profile.contact.email` de nenhum idioma, nem qualquer texto no formato de endereço de e-mail.
- [x] **CA10** — No perfil de cada `llms-full*.txt`, a linha do e-mail vira `- <common:navigation.contact do idioma>: <URL /<idioma>/contact>` ("Contato", "Contact", "Contacto"). A chave `email` sai de `LlmsLabels` e de `LLMS_LABELS`, porque fica sem uso (R2).
- [x] **CA11** — No currículo embutido em cada `llms-full*.txt`, toda ocorrência de `profile.contact.email` do idioma vira a URL de Contato do mesmo idioma. O resto do currículo fica igual ao `.md`, e o endereço vem do dado, nunca escrito no gerador.
- [x] **CA12** — `public/cv/cv-*.md`, `profile.json` e a página de Contato não mudam.

`robots.txt` (#210, NF-IA-12)

- [x] **CA13** — Cada um dos 12 grupos (`*` e os 11 de `AI_CRAWLERS`) é `User-agent: <agente>`, depois `Allow: /`, depois `Content-Signal: search=yes, ai-input=yes, ai-train=yes`, cada linha terminada em `\n`. A linha aparece exatamente 12 vezes, e o arquivo continua sem `Disallow` e terminando em `Sitemap: <URL absoluta>\n`.
- [x] **CA14** — A assinatura `buildRobotsTxt(sitemapUrl)` não muda, e a política fica numa constante em `scripts/seo/`.

Build, E2E e docs

- [ ] **CA15** — `scripts/seo/writeSeoFiles.ts` sem diff (`git diff origin/staging -- scripts/seo/writeSeoFiles.ts` vazio). `writeSeoFiles.test.ts` afirma, sobre os seis arquivos gerados de verdade: os três resumos no `llms.txt`, nenhum e-mail nos `llms*.txt` e a linha `Content-Signal` no `robots.txt`.
- [ ] **CA16** — `e2e/machine-files.spec.ts` (NF-IA-05, NF-IA-06, NF-IA-12 nos títulos) afirma o mesmo sobre o build da Fatec: `llms.txt` nos três idiomas, nenhum e-mail nos `llms*.txt` com o link de Contato no lugar, e `Content-Signal` em cada grupo. Sem spec novo e sem mudança em `specClassification.ts`.
- [ ] **CA17** — `docs/product/non-functional-requirements.md` (NF-IA-05, NF-IA-06, NF-IA-12), `docs/architecture/frontend.md` ("Arquivos para buscadores e IA") e `docs/design/decisions.md` (duas decisões novas, com a data 11-11-2026, fonte `PO` e a nota de que o `Content-Signal` é proposta, pode mudar e o Google informa que não age sobre ele) descrevem o comportamento novo.

## Casos de borda

- QUANDO o currículo de um idioma não contém o e-mail ENTÃO o texto embutido é o `.md` sem mudança.
- QUANDO o e-mail aparece mais de uma vez no currículo ENTÃO todas as ocorrências são trocadas (`replaceAll`).
- QUANDO um idioma tem um `meta.description` ausente ou vazio ENTÃO `readSeoContent` falha em português, citando o arquivo, como já faz com JSON inválido; não sai linha de página sem descrição.
- QUANDO o build roda com outro `base` (Fatec, `/ra2581392423047/`) ENTÃO a URL de Contato que substitui o e-mail leva o mesmo `base` (`buildPageUrl`).

## Estratégia de validação

- **Checagens automatizadas:** testes de unidade em `scripts/test/` (`buildLlmsTxt`, `buildLlmsFullTxt`, `buildRobotsTxt`, `readSeoContent`, `writeSeoFiles`) e E2E `e2e/machine-files.spec.ts` sobre o `build:fatec`.
- **Checagens manuais:** `npm run build:fatec`, `npm run preview:fatec` e `curl -s http://localhost:4173/ra2581392423047/llms.txt` (e `llms-full*.txt`, `robots.txt`); leitura do `llms.txt` para conferir a voz e a ordem.
- **Rollback / mitigação:** cada issue é um commit; reverter o commit volta o arquivo correspondente. Se o `Content-Signal` mudar de grafia, a mudança fica na constante e no teste.

## Questões em aberto

- **`cv/cv-*.md` público com o e-mail.** O `llms.txt` liga os três `.md` do CV, que continuam com o endereço na linha 4. A decisão do PO cobre só os `llms*.txt`; tirar o e-mail do CV público é outra decisão (o CV precisa do e-mail para recrutador) e fica fora desta spec. Se o PO quiser, vira issue nova.
- **Grafia do `Content-Signal`.** Grafia usada: `Content-Signal: search=yes, ai-input=yes, ai-train=yes`, com as chaves `search`, `ai-input` e `ai-train`, valores `yes`/`no` separados por vírgula e espaço. Fonte: https://contentsignals.org, não conferida pelo `sdd` (sem acesso à rede); os docs do repositório não citam o padrão. O `executor` confere a grafia na fonte antes da T3 e anota a URL e a data de acesso na Evidência e no registro da decisão. Se a fonte divergir, para e devolve; sem acesso à rede, anota "grafia não conferida na fonte" e segue, e o Orc e o PO conferem antes do merge.

## Notas / decisões

- **Descartado: um `llms.txt` por idioma (`llms.en.txt`, `llms.es.txt`).** Não é convenção que crawler procure, e mudaria `writeSeoFiles.ts` e a regra de "exatamente seis arquivos", o que conflita com a trilha H.
- **Descartado: declarar que o português é o canônico** (a outra saída do critério da #206). O PO pediu os três idiomas.
- **Descartado: `###` por idioma dentro de cada `##`.** O formato de llmstxt.org só define `##` com listas de links; `###` seria lido como conteúdo solto por parsers simples.
- **Descartado: trocar o e-mail por regex genérica.** A troca usa o valor de `profile.contact.email` do idioma, que é o dado. A regex de e-mail fica só no teste, como rede de segurança contra outro endereço que apareça no conteúdo.
- **Rótulo da linha de Contato:** `common:navigation.contact`, que já é chave de tradução nos três idiomas. Não entra rótulo novo, e o `email` de `LLMS_LABELS` sai.
- **`Content-Signal` depois de `Allow: /`.** A ordem das linhas dentro do grupo não muda o significado para o REP (linha desconhecida é ignorada). Pôr a linha depois mantém válidas as asserções `User-agent: X\nAllow: /` de `buildRobotsTxt.test.ts` e da NF-IA-12 no E2E, e a mudança fica só de acréscimo. Vai em todos os grupos porque um crawler com grupo próprio ignora o grupo `*`.
- **`llmsLabels.ts` continua sendo o vocabulário das seções.** Não é conteúdo nem descrição: são os títulos de seção da #51, já nos três idiomas. Migrar para `src/locales/` exigiria um namespace que o cliente não usa, e fica fora.
- **IDs de decisão.** As duas decisões entram em `docs/design/decisions.md` com os próximos IDs livres na hora do commit (hoje o último é `D69`; o `executor` confere com `grep` na `origin/staging` atualizada, porque outras trilhas em paralelo podem ocupar `D70`).
- **Commits:** um por issue, nesta ordem: `Feat :sparkles: [#206] Publica o llms.txt em inglês e espanhol`, `Fix :bug: [#212] Troca o e-mail por link para Contato nos arquivos para IA` e `Feat :sparkles: [#210] Declara a política de IA no robots.txt com Content-Signal`. Cada commit leva o código, os testes de unidade, o E2E e os docs da sua issue.
