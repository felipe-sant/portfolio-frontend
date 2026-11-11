# Decisões de arquitetura (ADR)

Um ADR registra uma decisão técnica que continua valendo depois da mudança que a motivou.

## Quando escrever

- A decisão é difícil de reverter ou afeta várias partes do frontend.
- Existiam alternativas reais e a escolha precisa ser justificada para quem chegar depois.
- Alguém já perguntou "por que fazemos assim?" mais de uma vez.

## Numeração

Quatro dígitos sequenciais e um tema curto em inglês: `0002-routing-library.md`. O número nunca é reaproveitado. Um ADR superado muda o status para `substituída por 000N` e continua no repositório.

## Cabeçalho

Todo ADR abre com o título `# <número>. <título>` e três linhas, como no [molde](0000-template.md): **Status** e **Data** (`dd-mm-aaaa`) entre crases e **Issues** com o link de cada issue de origem ou relacionada (ou `sem issue`, com o motivo). Toda issue citada no corpo também leva link.

## Relatórios

Evidência longa (spike, medição, roteiro testado) não entra no ADR: fica em `reports/<número do ADR>-<tema>.md`, com link nos dois sentidos. O ADR guarda só contexto, decisão, consequências e alternativas.

## Índice

| Número                           | Título                     | Status |
| -------------------------------- | -------------------------- | ------ |
| [0000](0000-template.md)         | Molde de ADR               | molde  |
| [0001](0001-state-management.md) | Gerenciamento de estado    | aceita |
| [0002](0002-language-in-path.md) | Idioma no caminho da URL   | aceita |
| [0003](0003-hosting-vercel.md)   | Hospedagem na Vercel       | aceita |
| [0004](0004-prerendering.md)     | Pré-renderização das rotas | aceita |

Relatório: [`reports/0004-prerendering-spike.md`](reports/0004-prerendering-spike.md), do spike que sustenta o ADR 0004.
