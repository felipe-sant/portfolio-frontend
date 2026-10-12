## Context

Charges were checked manually and reconciliation errors only showed up days later.

## My role

I built the API and the data model on my own.

## Solution

A Go API records each charge, consumes payment events from a queue and reprocesses what failed.

## Technical decisions

| Decision   | Reason                                   |
| ---------- | ---------------------------------------- |
| Redis      | Simple queue to reprocess events         |
| PostgreSQL | Transactions to keep balances consistent |

## Outcome

Reconciliation became automatic and errors show up on the same day.
