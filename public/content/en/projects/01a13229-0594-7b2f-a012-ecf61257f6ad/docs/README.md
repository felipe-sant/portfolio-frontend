## Context

Academic project to practice state and form handling in React: converting length, weight and temperature units between each other.

## My role

I developed it on my own, pure frontend, with no backend.

## Solution

The user chooses a category (length, weight or temperature), enters a value and the source unit, and the system calculates and displays the converted value in the target unit. A button lets the user quickly swap the source and target units.

## Technical decisions

All the conversion logic runs on the client, with no need for an external API. The conversion formulas between units are fixed and well known, so there is no reason to depend on an external service for this (unlike conversions that depend on up-to-date data, such as currency).

## Outcome

It works as expected, tested by converting length (km to m).

## Learnings

A small project, but useful to reinforce that not every "conversion" feature needs an API: sometimes plain logic already solves it, with fewer points of failure.
