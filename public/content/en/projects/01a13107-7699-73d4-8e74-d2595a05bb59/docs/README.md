## Context

The city's points of interest were scattered across spreadsheets and websites, with no single map to consult.

## My role

I built the project on my own, from the database to the interface.

## Solution

A web application with an interactive map and an API that calculates routes and filters points by category using spatial queries.

## Technical decisions

| Decision | Reason                                |
| -------- | ------------------------------------- |
| PostGIS  | Spatial queries inside the database   |
| Vite     | Fast builds and minimal configuration |

## Outcome

The map is published and receives new points every week. The same API structure was reused in the event check-in app. See also [Event check-in](project:01a13107-7699-72c5-a7a5-a5ddd278d026).

## Learnings

Measuring the spatial queries before optimizing avoided unnecessary work.
