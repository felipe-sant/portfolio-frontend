## Contexto

Projeto acadêmico para praticar manipulação de estado e formulários em React: converter unidades de comprimento, peso e temperatura entre si.

## Mi rol

Desenvolvi sozinho, frontend puro, sem backend.

## Solución

O usuário escolhe uma categoria (comprimento, peso ou temperatura), informa um valor e a unidade de origem, e o sistema calcula e exibe o valor convertido na unidade de destino. Um botão permite inverter rapidamente a unidade de origem e destino.

## Decisiones técnicas

Toda a lógica de conversão roda no cliente, sem necessidade de API externa — as fórmulas de conversão entre unidades são fixas e conhecidas, então não há motivo para depender de um serviço externo para isso (diferente do conversor de moedas, que precisa de taxas atualizadas).

## Resultado

Funciona corretamente — testado convertendo comprimento (km para m) com resultado correto.

## Aprendizajes

Projeto pequeno, mas útil para reforçar que nem toda funcionalidade "de conversão" precisa de uma API: às vezes a lógica pura já resolve, com menos pontos de falha.
