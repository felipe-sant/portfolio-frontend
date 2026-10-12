## Context

Tracking orders meant opening three different systems.

## My role

I built the API and the data model on my own.

## Solution

A command queries the order systems, shows the status in a table and warns when an order passes its deadline.

## Technical decisions

| Decision | Reason                                      |
| -------- | ------------------------------------------- |
| Go       | A single binary, easy to distribute         |
| Docker   | Same runtime environment for the whole team |

## Outcome

Daily tracking started to take only a few minutes.
