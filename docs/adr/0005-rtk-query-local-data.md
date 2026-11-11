# 0005. RTK Query com `queryFn` sobre dados locais

- **Status:** `aceita`
- **Data:** `11-11-2026`
- **Issues:** [#159](https://github.com/felipe-sant/portfolio-frontend/issues/159), [#43](https://github.com/felipe-sant/portfolio-frontend/issues/43), [#44](https://github.com/felipe-sant/portfolio-frontend/issues/44)

## Contexto

O [ADR 0001](0001-state-management.md) manteve Redux Toolkit, RTK Query e `src/services/http/` para o backend futuro e começou a aplicação sem backend (R1). Na v1 o site é estático no GitHub Pages e o conteúdo vem de JSON e Markdown em `public/content/`. Visto de fora, a camada de dados parece arquitetura de backend aplicada a um site estático: o `baseQuery` com `fetchBaseQuery` de `src/store/api.ts` nunca é chamado, porque todo endpoint usa `queryFn`; `src/services/http/get.ts` e `post.ts` só são importados pelos testes, e `parseResponse.ts` só por eles; e há dois caches, o de leitura (`readText`, em `src/services/content/`) e o do RTK Query.

A revisão de código de 08-11-2026 (achado C-02) apontou isso. O PO decidiu manter tudo até a [#43](https://github.com/felipe-sant/portfolio-frontend/issues/43), que troca a fonte local pela API, e registrar o porquê aqui.

## Decisão

- **RTK Query como acesso a dados desde a v1.** As páginas consomem os hooks gerados dos endpoints de `src/store/api/<domínio>.api.ts`, com o argumento (`lang` e parâmetros) e o tipo de resposta do contrato de [`api-contract.md`](../architecture/api-contract.md). O estado das consultas vive na store, que a pré-renderização serializa (`preloadedState`) e o cliente usa para hidratar sem pedir os dados de novo nem divergir do HTML ([ADR 0004](0004-prerendering.md)).
- **`queryFn` enquanto não há backend.** Cada endpoint valida o argumento e chama `src/services/content/`, que lê `public/` e devolve `{ data }` ou `{ error }` no formato da API, simulando busca, filtros, ordenação e paginação. Página, hook de página e componente nunca importam essa camada.
- **O que a [#43](https://github.com/felipe-sant/portfolio-frontend/issues/43) troca.** Cada `queryFn` de leitura vira `query` com o mesmo argumento e o mesmo tipo de resposta, e passa a usar o `baseQuery` (`fetchBaseQuery` com `VITE_API_URL` e `Accept-Language`). Saem `src/services/content/`, o cache de leitura e os dados de `public/content/`, e a filtragem passa para o servidor. Nenhuma página, hook de página ou componente muda. O envio do formulário de Contato (`contact.api.ts`, que hoje simula o envio) é da [#44](https://github.com/felipe-sant/portfolio-frontend/issues/44).

### Arquivos sem uso até a #43

Ficam no repositório de propósito, cobertos por teste, e não devem ser removidos como código morto:

| Arquivo                                                                                       | Situação na v1                                                                  | Quando passa a ser usado ou sai                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/store/api.ts` (`baseQuery` com `fetchBaseQuery` e `prepareHeaders`)                      | Declarado, nunca chamado: todo endpoint usa `queryFn`                           | Na [#43](https://github.com/felipe-sant/portfolio-frontend/issues/43), quando os endpoints passam a `query`                                                                                                      |
| `src/services/http/get.ts`, `src/services/http/post.ts`, `src/services/http/parseResponse.ts` | `get.ts` e `post.ts` só importados pelos testes; `parseResponse.ts` só por eles | Cliente HTTP para chamada fora do RTK Query; a [#43](https://github.com/felipe-sant/portfolio-frontend/issues/43) ou a [#44](https://github.com/felipe-sant/portfolio-frontend/issues/44) decide usar ou remover |
| `src/services/http/apiUrl.ts`                                                                 | Lido por `api.ts`, `get.ts` e `post.ts`; vazio sem `VITE_API_URL`               | Na [#43](https://github.com/felipe-sant/portfolio-frontend/issues/43), com `VITE_API_URL` definida                                                                                                               |

## Consequências

- A troca pela API fica restrita a `src/store/api/` e à remoção da camada local: as telas não mudam e os testes de tela continuam valendo.
- A pré-renderização e a hidratação usam o mesmo estado serializável que a aplicação usará com a API.
- Até a [#43](https://github.com/felipe-sant/portfolio-frontend/issues/43) há código no bundle e na suíte sem uso pela interface, e dois caches: o de leitura evita ler `projects.json` e `profile.json` mais de uma vez por carga, e o do RTK Query guarda a resposta por argumento. O de leitura sai com a camada local.
- Quem revisar o código e achar esses arquivos sem uso consulta a tabela acima antes de propor a remoção.

## Alternativas

- **Ler o JSON direto nos hooks de página, sem store:** menos código agora, mas a [#43](https://github.com/felipe-sant/portfolio-frontend/issues/43) reescreveria todas as telas e a pré-renderização precisaria de outro jeito de serializar os dados para a hidratação.
- **Remover `fetchBaseQuery` e o cliente HTTP até a #43:** deixaria o bundle menor, mas a [#43](https://github.com/felipe-sant/portfolio-frontend/issues/43) teria de reintroduzir a configuração (`VITE_API_URL`, `Accept-Language`) e os testes, que já estão prontos e conferidos.
- **Simular a API com um servidor de mock (MSW ou similar) e usar `query` desde já:** exigiria dependência nova e um service worker no GitHub Pages, sem ganho para quem visita o site.
