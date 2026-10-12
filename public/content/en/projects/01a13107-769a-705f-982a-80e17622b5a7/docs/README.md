## Context

Putting together recurring reports required copying data between files and formatting everything by hand.

## My role

I built the API and the data model on my own.

## Solution

A command takes a data file and a template and generates the report in PDF or CSV.

## Technical decisions

| Decision  | Reason                                    |
| --------- | ----------------------------------------- |
| Node.js   | Simple distribution as an npm package     |
| Commander | Argument parsing without writing a parser |

## Outcome

The project was discontinued when the team started using the sales dashboard for the same reports.
