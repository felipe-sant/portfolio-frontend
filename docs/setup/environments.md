# Ambientes

> Exemplo: ambientes do frontend fictício. Substitua pelos do projeto real.

## Ambientes

| Ambiente    | Para que serve                | Como subir                                                     |
| ----------- | ----------------------------- | -------------------------------------------------------------- |
| Local       | Desenvolvimento no computador | `npm run dev` e abrir `http://localhost:5173`                  |
| Homologação | Validação antes de publicar   | Build com as variáveis de homologação, publicado pelo pipeline |
| Produção    | Usuários finais               | Build com as variáveis de produção, publicado pelo pipeline    |

## Variáveis

A fonte das variáveis é o `.env.example` da raiz. Só variáveis com prefixo `VITE_` chegam ao código do cliente, lidas com `import.meta.env.VITE_ALGO`.

| Variável       | Local                   | Homologação                       | Produção                  |
| -------------- | ----------------------- | --------------------------------- | ------------------------- |
| `VITE_API_URL` | `http://localhost:3000` | `https://api.staging.example.com` | `https://api.example.com` |

## Segredos

Tudo o que vai no build do frontend é público, então não coloque segredo em variável `VITE_*`. Credenciais de deploy e tokens de pipeline ficam no cofre de segredos do provedor de CI, fora do repositório.
