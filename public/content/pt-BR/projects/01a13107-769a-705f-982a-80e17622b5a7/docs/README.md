## Contexto

Montar relatórios recorrentes exigia copiar dados entre arquivos e formatar tudo manualmente.

## Meu papel

Fiz sozinho a API e o modelo de dados.

## Solução

Um comando recebe um arquivo de dados e um modelo e gera o relatório em PDF ou CSV.

## Decisões técnicas

| Decisão   | Motivo                                       |
| --------- | -------------------------------------------- |
| Node.js   | Distribuição simples como pacote npm         |
| Commander | Leitura de argumentos sem escrever um parser |

## Resultado

O projeto foi descontinuado quando o time passou a usar o painel de vendas para os mesmos relatórios.
