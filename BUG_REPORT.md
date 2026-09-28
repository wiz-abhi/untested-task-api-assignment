# Bug Report

## Fixed: first pagination page skipped

- Expected: `GET /tasks?page=1&limit=2` returns the first two tasks.
- Actual: the service calculated `offset = page * limit`, so page 1 started at index 2 and skipped the first page.
- Discovered by: `taskService` pagination unit test and the route pagination integration test.
- Location: `task-api/src/services/taskService.js`, `getPaginated`.
- Root cause: page numbers are one-based, while array indexes are zero-based.
- Fix: calculate `(page - 1) * limit` and add regression coverage for pages 1 and 2.

## README/API terminology inconsistency

- Expected: one consistent set of status values across documentation and implementation.
- Actual: the assignment/source use `todo`, `in_progress`, and `done`, while the README task shape and sample filter mention `pending`, `in-progress`, and `completed`.
- Discovered by: comparing the assignment, README, validators, and service implementation before writing tests.
- Impact: a client following the README can send values rejected by the API.
- Suggested fix: update the README to use the canonical values from `ASSIGNMENT.md` and add an API contract check.
- Status: documentation corrected in `README.md`; the canonical values now match the assignment and implementation.
