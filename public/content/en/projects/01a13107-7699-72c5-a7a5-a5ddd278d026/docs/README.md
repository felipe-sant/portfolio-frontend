## Context

The attendance list for the college events was kept on paper and took a long time to check.

## My role

I took part in the project end to end, in a team of three people.

## Solution

A mobile app reads the participant's QR code and sends the attendance to an API, which updates the list in real time. The API follows the structure of [City map](project:01a13107-7699-73d4-8e74-d2595a05bb59/docs/SETUP.md).

## Technical decisions

| Decision     | Reason                                    |
| ------------ | ----------------------------------------- |
| React Native | A single codebase for Android and iOS     |
| WebSocket    | List updates without reloading the screen |

## Outcome

Checking the list went from hours to minutes at the event where the app was tested.
