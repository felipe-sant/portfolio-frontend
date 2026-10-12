## Context

Sales indicators were assembled by hand in spreadsheets and were only ready at the end of the month.

## My role

I handled the data analysis, the model and the presentation of the results on my own.

## Solution

A Python pipeline consolidates the spreadsheets and a web dashboard shows the indicators by region and period.

## Technical decisions

| Decision   | Reason                                       |
| ---------- | -------------------------------------------- |
| Pandas     | Data cleaning and aggregation in a few lines |
| PostgreSQL | History that can be queried by period        |

## Outcome

The indicators became available the day after each sale was closed.
