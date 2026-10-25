## Context

Academic project to practice geographic calculation and frontend-backend integration: simulating a real flight route between two random points in Brazil, taking the curvature of the Earth into account instead of a straight line on a Cartesian plane.

## My role

I developed both the frontend and the backend on my own.

## Solution

The frontend renders the map with Leaflet, lets the user enter coordinates manually or click directly on the map, and simulates the aircraft's path in real time. The backend provides valid coordinates within Brazilian territory and, on every position update, returns geographic information (country, state, municipality, microregion and mesoregion) from the IBGE API.

## Technical decisions

The position along the route is calculated with spherical interpolation (Slerp) over the great-circle arc between the two coordinates, instead of linear interpolation. This guarantees that the path represents the real curvature of the Earth, not a straight line on a Cartesian plane. The backend was rewritten in December 2025, structured in layers of routes, controllers and services, with unit tests using Jest.

## Outcome

The frontend is live and works on its own, but it points to a previous version of the backend (old routes), since the backend was rewritten after the last frontend adjustment. Because of that, the location panel during the flight always returns "Desconhecido" (Unknown), a bug documented in [issue #3](https://github.com/felipe-sant/maps-front/issues/3).

## Learnings

Understanding the difference between linear and spherical interpolation for geographic calculations, and the importance of keeping frontend and backend in sync when they are separate repositories. The compatibility break was only noticed in a later review of the projects.
