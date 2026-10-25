## Context

Academic project to practice complete CRUD operations (create, list, edit, delete) with a NoSQL database, building both the frontend and the API.

## My role

I developed the frontend and the backend on my own.

## Solution

The application lets the user register expenses (description, date and amount), list all registered expenses, and edit and delete each one. The frontend consumes its own REST API, which persists the data in MongoDB through Mongoose.

## Technical decisions

Clear separation between frontend and backend in their own repositories, joined by a wrapper repository with git submodules. The backend exposes a simple REST API in Express, and the frontend uses plain React (no state libraries), with direct calls to the API.

## Outcome

The CRUD works end to end, tested by creating, listing and confirming the persistence of an expense. The interface, however, is still at prototype level (no real styling, with placeholder texts such as "Hello world"), so the project is marked for future visual rework.

## Learnings

The idea and the functional base of the project are solid. The biggest gap today is only interface polish, not logic or architecture.
