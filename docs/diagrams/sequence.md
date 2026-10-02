# Sequência: finalizar pedido

> Exemplo: interação da loja fictícia. Substitua pela sequência do projeto.

Use um `sequenceDiagram` para mostrar a ordem das mensagens entre usuário, frontend e API.

```mermaid
sequenceDiagram
    actor User as Usuário
    participant Frontend
    participant API
    User->>Frontend: Clica em finalizar pedido
    Frontend->>API: POST /orders
    alt Pedido criado
        API-->>Frontend: 201 com o pedido
        Frontend-->>User: Mostra a confirmação
    else Erro
        API-->>Frontend: 4xx ou 5xx com a mensagem
        Frontend-->>User: Mostra o erro e mantém o carrinho
    end
```
