## Contexto

Os formulários dos projetos repetiam as mesmas regras de validação e mensagens.

## Meu papel

Fiz o projeto sozinho, do banco de dados à interface.

## Solução

Uma biblioteca pequena define regras reutilizáveis, infere os tipos do formulário e traduz as mensagens.

## Decisões técnicas

| Decisão    | Motivo                                       |
| ---------- | -------------------------------------------- |
| TypeScript | Tipos inferidos a partir das regras          |
| Vitest     | Casos de teste escritos como exemplos de uso |

## Resultado

Foi publicada como pacote npm e reduziu o código de validação dos projetos que a usam.
