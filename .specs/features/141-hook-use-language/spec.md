# Spec: Hook useLanguage

> **Tipo:** `feature` <br />
> **Status:** `implementada` <br />
> **Issue:** `#141` <br />
> **Criado em:** `11-11-2026`

Refactor sem mudança de comportamento e sem tela nova: o `qa` não precisa de roteiro de tela; a regressão é coberta pelos testes de unidade existentes, pelo lint e pelo build.

## Problema

A expressão `resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE` está copiada em 16 lugares (fora de testes), cada um com `useTranslation()` só para ler `i18n`, e a mesma regra existe de novo em `src/i18n/getLanguage.ts`. A regra "idioma ativo = idioma resolvido, senão `en`" não tem dono único: mudá-la exige editar 17 arquivos.

Ocorrências: `src/pages/Project.page.tsx`; `src/pages/hooks/{useHome,useProjectDocument,useProject,useContact,useProjects,useAbout}.ts`; `src/hooks/{useShareImage,useLocalizedPath,useResume}.ts`; `src/components/{TrajectoryPeriod,StatusCard,PageMeta,LanguageSelector,Footer,ResumeModal}.tsx` (o `Footer` usa a variável `lang`; o `LanguageSelector` quebra a expressão em duas linhas).

## Objetivo

- Existe `useLanguage()` em `src/hooks/useLanguage.ts`, `export default`, que devolve o `SupportedLanguage` ativo, cai em `FALLBACK_LANGUAGE` quando o idioma resolvido é ausente ou não suportado e faz o componente re-renderizar na troca de idioma (`setLanguage`).
- As 16 ocorrências acima passam a chamar `useLanguage()`; `grep -rn "resolveSupportedLanguage(i18n.resolvedLanguage)" src` (fora de testes) não devolve nada.
- A regra fica em um só lugar: `getLanguage()` (`src/i18n/getLanguage.ts`) continua sendo a única função que a escreve, e o hook a reutiliza (ver Notas).
- Nenhum comportamento muda: suíte, `typecheck`, `lint` e `build` verdes.

## Fora de escopo

- Qualquer mudança em `src/store/` (a #160 trata de store/api; sem sobreposição).
- Mudar `resolveSupportedLanguage`, `FALLBACK_LANGUAGE` ou o `getLanguage()` usado fora de React (`prepareHeaders`, `src/services/`).
- Trocar `t` por outra API ou mexer em namespaces, textos e chaves de tradução (R2: nenhum texto de UI é criado ou alterado, então não há JSON de locale a tocar).
- Changeset: não é tarefa do `executor`; o `patch` é criado pelo Dev ao abrir o PR.

## Critérios de aceite

- [ ] A1: `useLanguage()` devolve o idioma ativo (`pt-BR`, `en`, `es`) — teste do hook.
- [ ] A2: com idioma resolvido ausente ou não suportado, devolve `FALLBACK_LANGUAGE` (`en`) — teste do hook.
- [ ] A3: depois de `setLanguage("es")` dentro do `it`, o valor devolvido muda para `es` sem remontar o hook — teste do hook.
- [ ] A4: as 16 ocorrências usam `useLanguage()` e a expressão repetida some de `src/` (fora de `getLanguage.ts`) — `grep` da tarefa T2/T3.
- [ ] A5: nenhum arquivo alterado mantém `useTranslation`, `i18n`, `resolveSupportedLanguage` ou `FALLBACK_LANGUAGE` sem uso — `npm run lint` e `typecheck`.
- [ ] A6: a suíte existente passa sem alterar asserções de testes de consumidores — `npm test -- --run --maxWorkers=2`; build e E2E rodam no CI.
- [ ] A7: a documentação cita o hook onde descreve a API de idioma — `docs/architecture/frontend.md`.

## Estratégia de validação

- **Checagens automatizadas:** teste novo `src/hooks/test/useLanguage.test.tsx` (TDD); testes existentes dos 16 consumidores (`useResume`, `useShareImage`, `useLocalizedPath`, páginas, `Footer`, `PageMeta`, `LanguageSelector` etc.); `typecheck`, `lint`, `test:cov` e `build` na última tarefa.
- **Checagens manuais:** nenhuma obrigatória (sem mudança visual). Opcional: `npm run dev`, trocar o idioma no seletor e conferir que Início, Projetos, Projeto, Informações e Contato, rodapé e modal de currículo seguem no idioma escolhido.
- **Rollback:** reverter o commit; cada consumidor volta à expressão anterior sem efeito colateral.

## Riscos e dependências

- **Conflito com o PR #251 (trilha I, aberto):** ele altera `src/pages/Project.page.tsx`, `src/pages/Projects.page.tsx`, `src/pages/hooks/useProjects.ts` e os testes de `Project` e `Projects`. Dos arquivos desta spec, conflitam `Project.page.tsx` e `useProjects.ts` (`Projects.page.tsx` não contém a expressão e só conflita se o #251 a mudar; conferir após o rebase). A implementação só começa **depois do merge do #251**, e a T1 é o rebase em `origin/staging`. Os outros 14 arquivos não conflitam.
- **Suspense:** `useTranslation()` sem namespace já é o que `useLocalizedPath` e `useResume` fazem; o hook mantém essa chamada, então o carregamento de namespaces não muda. O `executor` confirma com a suíte.
- **Namespaces:** consumidores que usam `t` mantêm o próprio `useTranslation(<ns>)`; só os que usavam `i18n` apenas para o idioma perdem a chamada (candidatos: `useProjectDocument`, `useLocalizedPath`, `useResume`, o componente em `Footer.tsx:196`, e outros que o lint apontar).

## Questões em aberto

- Q1 (PO): confirmar que o hook reutiliza `getLanguage()` (recomendado, regra em um só lugar) em vez de reescrever a expressão dentro do hook e manter `getLanguage` como segunda cópia.
- Q2 (PO): nome do teste `src/hooks/test/useLanguage.test.tsx` (extensão `.tsx` por usar `renderHook` com `act`/`setLanguage`; os vizinhos usam `.ts` ou `.tsx` conforme o caso). Assumido como está.

## Notas / decisões

- `getLanguage()` continua como está (não é hook, é usada em `src/services/` e `prepareHeaders`). `useLanguage()` chama `useTranslation()` apenas para assinar a troca de idioma (re-render) e devolve `getLanguage()`, já que `react-i18next` usa a mesma instância `i18n` singleton (`initReactI18next`). Alternativa descartada: duplicar a expressão no hook (volta a ter duas cópias da regra).
- Docs: `docs/architecture/frontend.md` (linhas ~32, 261, 309) descreve `getLanguage()`/`useLocalizedPath()`; `code-structure.md` e o `CLAUDE.md` não citam a expressão repetida. Atualizar só `frontend.md` (uma frase sobre `useLanguage()` na "API de idioma") e, se existir catálogo de hooks, listá-lo; `docs/architecture/components.md` não precisa mudar.
- Identificador do consumidor: o `Footer` renomeia `lang` para `language`? Não: mantém `lang` (`const lang = useLanguage()`) para não ampliar o diff.
