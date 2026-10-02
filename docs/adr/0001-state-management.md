# 0001. Gerenciamento de estado

> Exemplo: decisão fictícia da loja. Substitua pelas decisões reais do projeto.

- **Status:** aceita
- **Data:** 01-10-2026

## Contexto

O carrinho é lido por várias telas e o catálogo vem da API. Passar esses dados por props deixou o código frágil, e cada tela buscava os mesmos produtos de novo.

## Decisão

Estado de cliente (carrinho, filtros) em slices do Redux Toolkit e estado de servidor (catálogo, pedidos) em endpoints do RTK Query, ambos em `src/store/`.

## Consequências

- Uma única fonte de verdade para o carrinho e cache automático das respostas da API.
- Toda tela que lê a store passa a depender dela nos testes, que precisam de um provider.
- A equipe precisa conhecer o modelo de slices e endpoints.

## Alternativas

- **Context API:** simples, mas re-renderiza os consumidores a cada mudança e não resolve cache de servidor.
- **Zustand mais uma biblioteca de dados:** menos código, porém dois modelos mentais para estado de cliente e de servidor.
