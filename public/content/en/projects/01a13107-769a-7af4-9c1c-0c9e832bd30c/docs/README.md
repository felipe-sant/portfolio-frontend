## Context

The projects' forms repeated the same validation rules and messages.

## My role

I built the project on my own, from the database to the interface.

## Solution

A small library defines reusable rules, infers the form types and translates the messages.

## Technical decisions

| Decision   | Reason                               |
| ---------- | ------------------------------------ |
| TypeScript | Types inferred from the rules        |
| Vitest     | Test cases written as usage examples |

## Outcome

It was published as an npm package and reduced the validation code in the projects that use it.
