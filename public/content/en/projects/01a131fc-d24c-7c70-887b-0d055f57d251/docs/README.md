## Context

Hobby project, made just for fun in a single day: an "irresistible dating proposal" website, where the decline button runs away from the cursor whenever the user tries to get close to it.

## My role

I developed it on my own, from scratch to deploy.

## Solution

When the mouse gets close to the "Não" (No) button, its position is randomly recalculated within the screen, making it practically impossible to click. The "Sim" (Yes) button accepts the invitation and redirects to a song.

## Technical decisions

The "escape" logic is simple and direct: on the mouseover event (and on click, as extra safety), the button receives a new absolute position randomly generated within a safe area of the screen, through a position generation utility function.

## Outcome

Small and functional project, published and live.

## Learnings

Sometimes a project does not need to solve a serious problem to be a good frontend exercise. It was a light way to practice DOM manipulation and dynamic element positioning.
