# Ambientes

## Ambientes

| Ambiente | Para que serve                | Como subir                                    |
| -------- | ----------------------------- | --------------------------------------------- |
| Local    | Desenvolvimento no computador | `npm run dev` e abrir `http://localhost:5173` |

Homologação e produção ainda não estão definidos: não há hospedagem nem pipeline de publicação escolhidos. Quando existirem, entram nesta tabela.

## Variáveis

A fonte das variáveis é o `.env.example` da raiz. Só variáveis com prefixo `VITE_` chegam ao código do cliente, lidas com `import.meta.env.VITE_ALGO`.

| Variável       | Local | Para que serve                                                |
| -------------- | ----- | ------------------------------------------------------------- |
| `VITE_API_URL` | vazia | URL base do backend, lida só em `src/services/http/apiUrl.ts` |

O backend ainda não existe e a aplicação usa dados mock, então `VITE_API_URL` fica vazia ou ausente. Sem a variável, `apiUrl.ts` usa string vazia e as requisições saem com caminho relativo. O valor do `.env.example` é só um modelo do formato.

## Segredos

Tudo o que vai no build do frontend é público, então não coloque segredo em variável `VITE_*`. Credenciais de deploy e tokens de pipeline ficam no cofre de segredos do provedor de CI, fora do repositório.
