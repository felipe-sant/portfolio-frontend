# Spec: Verificação da v1 (checklist executável e pré-check automatizado)

> **Tipo:** `feature` <br />
> **Status:** `em-revisao` <br />
> **Issue:** `#41` <br />
> **Criado em:** `12-11-2026`

## Problema

A #41 exige verificar a v1 no GitHub Pages: a checklist de `docs/product/accessibility.md` em cada tela, 360/390/768/1280px nos dois temas e nos estados especiais (PI3), o contraste do bloco de código no escuro (PI2), as metas e o roteiro de `docs/product/non-functional-requirements.md`, NF-IA-18 e Lighthouse SEO. Hoje esses itens estão espalhados por três documentos, sem lugar para registrar resultado, quem verificou, quando e qual issue `Fix` cobre a falha. A execução manual (NVDA com Chrome, TalkBack, Lighthouse e axe DevTools no site publicado) é do PO e precisa começar com tudo pronto.

## Objetivo

Deixar a verificação pronta para execução, sem executá-la:

1. Um documento executável, `docs/product/v1-verification.md`, em que cada linha é uma checagem com as colunas `Resultado` (vazia), `Quem fez`, `Data` e `Issue Fix`.
2. Uma divisão clara entre o que o QA roda automatizado como pré-check e o que só o PO pode fazer (leitor de tela e aparelho real).
3. A regra de que toda falha vira uma issue `Fix` e nunca é corrigida na #41.

## Fora de escopo

- Executar a verificação manual, registrar resultados no documento ou abrir issues `Fix` (nesta etapa).
- Corrigir qualquer falha encontrada.
- Alterar `accessibility.md` ou `non-functional-requirements.md`: o documento novo referencia e resume; as fontes continuam lá.
- Acrescentar dependência (Lighthouse roda por `npx` fora do `package.json`, sem entrar no projeto).

## Conteúdo do documento `docs/product/v1-verification.md`

| Seção                            | O que traz                                                                                                                                                                                                               | Origem                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Como usar                        | Alvo (Pages), valores de `Resultado`, preenchimento de `Quem fez`/`Data`, regra da issue `Fix`                                                                                                                           | #41                                                     |
| Ferramentas e ambiente           | NVDA, TalkBack, Lighthouse, axe DevTools, zoom 200% e 400%, zoom só de texto, espaçamento de texto (1.4.12), cores forçadas                                                                                              | método de `accessibility.md`                            |
| Roteiro de verificação           | Os comandos `curl` e as ferramentas, uma linha por checagem                                                                                                                                                              | `non-functional-requirements.md#roteiro-de-verificação` |
| Varredura de largura e tema      | Uma linha por tela e estado especial × 360/390/768/1280 × claro/escuro; contraste de PI2, PI3, do `--text-label` sobre `--bg-raised` no escuro, de foco e de borda de campo                                              | NF-RE-01, NF-RE-03, PI2, PI3, achados                   |
| Acessibilidade por tela          | Uma tabela para o layout e uma para cada tela (Início, Projetos, Projeto e documento, Informações, Contato, Não encontrada e erro), com os itens de "Todas as telas" mais os da tela, cada um com a forma de verificação | checklist por tela                                      |
| Achados                          | Os achados de `accessibility.md#achados` conferidos no build publicado                                                                                                                                                   | seção "Achados"                                         |
| Desempenho                       | Tabela de NF-DE-01 a NF-DE-15 e NF-DE-21 com valor medido, mais Lighthouse mobile por rota e INP por interação                                                                                                           | NF-DE                                                   |
| Demais requisitos não funcionais | As linhas dos demais temas cujo `Quando` inclui a #41                                                                                                                                                                    | NF-*                                                    |
| Legibilidade por IA              | Linhas de NF-IA com #41, Lighthouse SEO ≥ 95 por rota e idioma (NF-IA-19) e a checagem de NF-IA-18 em ChatGPT, Claude e Perplexity                                                                                       | NF-IA                                                   |

As tabelas de acessibilidade e de requisitos são geradas a partir dos documentos de origem, para não haver item inventado ou esquecido; o documento de origem continua sendo a fonte, e o ID de cada linha leva a ele.

## Divisão entre QA e PO

| Camada                                                                      | QA (pré-check automatizado)                                                                                                   | PO (executa no Pages)                                  |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| axe nas rotas, nos dois temas, em 390 e 1280px (A11Y-G04)                   | Playwright com `@axe-core/playwright`, que já existe em `e2e/`                                                                | axe DevTools em cada tela                              |
| Larguras 360, 390, 768 e 1280px, claro e escuro (NF-RE-03)                  | Script Playwright que mede `scrollWidth` contra `clientWidth` e tira captura, nas rotas e nos estados alcançáveis sem backend | Olhar as capturas e o DevTools no Pages                |
| Zoom 200% e 400% (reflow) e cores forçadas (`forced-colors`)                | Playwright com `deviceScaleFactor` e `colorScheme`/`forcedColors` emulados                                                    | Zoom real do navegador e temas de contraste do Windows |
| Espaçamento de texto (1.4.12)                                               | Playwright injeta o CSS do bookmarklet e mede corte e sobreposição                                                            | Bookmarklet no navegador                               |
| Contraste de token, PI2, PI3 e o par `--text-label`/`--bg-raised`           | Fórmula da WCAG sobre os tokens de `global.css` e `getComputedStyle`                                                          | Conferência no navegador                               |
| Lighthouse mobile e desktop (NF-DE, NF-IA-19)                               | `npx lighthouse` em Chromium headless contra a staging e contra `npm run build:fatec` servido em porta própria                | Lighthouse no Pages                                    |
| Roteiro `curl` (status, `h1`, JSON-LD, canônica, `llms.txt`, `sitemap.xml`) | Rodado contra a staging e contra o build local com o `base` do Pages                                                          | Rodado contra o Pages                                  |
| Teclado e foco (roteiros `[e2e]`)                                           | Suíte E2E existente rodada contra o build com o `base` do Pages                                                               | Teclado sem mouse, item `[teclado]`                    |
| Leitor de tela (NVDA, TalkBack) e aparelho real                             | Não se aplica                                                                                                                 | Só o PO                                                |
| NF-IA-18 (ChatGPT, Claude, Perplexity)                                      | Não se aplica                                                                                                                 | Só o PO                                                |

O resultado de um pré-check entra no documento como `pré-check` na coluna `Resultado`, nunca como `OK`: a linha só fecha com `OK`, o nome de quem verificou e a data, no Pages.

**Limite da staging.** A staging é `https://felipe-sant-beta.vercel.app`, na raiz e com `noindex`; o alvo é o Pages, em `/ra2581392423047/`. Por isso, na staging, o Lighthouse SEO sai abaixo da meta por causa do `noindex` e `base`, canônica, `sitemap.xml` e `llms.txt` apontam para outra origem. O pré-check de `base` e de SEO fica mais fiel contra `npm run build:fatec` com `SITE` do Pages, servido localmente.

## Regras

- **Falha vira issue `Fix`.** Cada falha ganha uma issue própria no projeto Portfolio, com `Tipo` `BUG`, o ID da linha e o passo para reproduzir; o link vai na coluna `Issue Fix`. Nunca se corrige na #41.
- **Sem falha sem issue.** A #41 só fecha com toda linha em `OK`, `N/A` com motivo ou ligada a uma issue `Fix`.
- **A verificação final é no Pages.** Resultado da staging ou do build local não substitui.

## Critérios de aceite

- [ ] `docs/product/v1-verification.md` existe, com as seções da tabela "Conteúdo do documento" e todas as colunas de resultado vazias.
- [ ] Todo item `A11Y-*` ativo de `accessibility.md#checklist-por-tela` aparece uma vez na tabela da sua tela (itens substituídos ficam de fora).
- [ ] Todo `NF-*` cujo `Quando` inclui a #41 aparece em alguma tabela, mais NF-DE-01 a NF-DE-15, NF-IA-18 e NF-IA-19.
- [ ] A varredura traz as quatro larguras nos dois temas, para cada tela e estado das tabelas "Estados" de `docs/screens/`.
- [ ] `docs/README.md` lista o documento novo.
- [ ] O documento passa no `prettier` e não tem comentário nem HTML solto.
- [ ] Nenhum código de `src/` é alterado e nenhuma dependência é acrescentada.

## Estratégia de validação

- **Checagens automatizadas:** `prettier --check` no documento; um script descartável compara os IDs `A11Y-*` e `NF-*` das fontes com os do documento e acusa diferença (não é commitado).
- **Checagens manuais:** o PO lê o documento e confirma se os estados da varredura e a divisão de responsabilidades estão certos.
- **Rollback / mitigação:** só documentação; reverter o commit.

## Questões em aberto

1. **Lighthouse no projeto:** rodar por `npx lighthouse` (sem entrar no `package.json`) basta como pré-check? Entrar como devDependency exige a checagem de "Dependências novas" do `CLAUDE.md`.
2. **Quem abre as issues `Fix`:** o QA abre à medida que o pré-check acha falha, ou todas ficam para o PO depois da execução no Pages? A regra desta spec é que a falha só vira issue depois do registro na linha do documento.
3. **Onde fica o registro:** o PO preenche o documento direto no `staging` (um PR por rodada), ou numa branch única da #41 que vira o PR que fecha a issue?
4. **Estado do Pages:** o Pages já está publicado com o build final? Sem isso, a execução do PO espera o publish (`fatec-pages.yml`).
5. **Escopo de idioma:** o checklist roda por completo em `pt-BR` e por amostra em `en` e `es` (nomes acessíveis, A11Y-G15, e NF-IN). Isso basta, ou o PO quer os três idiomas completos?
6. **Aparelho:** o TalkBack será no Android do PO, com Chrome; confirmar o modelo e a versão para o registro.

## Notas / decisões

- O documento é gerado das fontes (checklist e tabelas de NF-*) para que a cobertura seja exata, e depois é editado à mão só onde o resumo precisa de ajuste.
- A tabela de varredura usa uma linha por tela e estado, com oito colunas (4 larguras × 2 temas), em vez de uma tabela por largura, para o PO preencher a tela inteira de uma vez.
