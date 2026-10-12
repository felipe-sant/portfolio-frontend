## Contexto

A lista de presença dos eventos da faculdade era feita em papel e demorava para ser conferida.

## Meu papel

Participei do projeto de ponta a ponta, em um time de três pessoas.

## Solução

Um aplicativo móvel lê o QR code do participante e envia a presença para uma API, que atualiza a lista em tempo real. A API segue a estrutura do [Mapa da cidade](project:01a13107-7699-73d4-8e74-d2595a05bb59/docs/SETUP.md).

## Decisões técnicas

| Decisão      | Motivo                                     |
| ------------ | ------------------------------------------ |
| React Native | Um código só para Android e iOS            |
| WebSocket    | Atualização da lista sem recarregar a tela |

## Resultado

A conferência da lista passou de horas para minutos no evento em que o aplicativo foi testado.
