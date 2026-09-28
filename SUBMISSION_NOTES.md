# Submission Notes

## What I would test next

- Invalid and extreme pagination values, including non-numeric, zero, negative, and very large values.
- Concurrent writes and behavior if the in-memory store is replaced with a database.
- Strict ISO-8601 date validation and timezone boundaries.
- Unknown fields and immutable-field protection during updates.
- Contract tests for a deployed API and automated CI coverage thresholds.

## What surprised me

The service is intentionally small, but a one-line pagination boundary error changes every paginated response. The README also uses different status names from the assignment and implementation, which is easy for an API consumer to miss.

## Questions before production

- Should assigning a task replace an existing assignee, or should reassignment be rejected?
- Should pagination reject invalid values or normalize them to defaults?
- What authentication and authorization rules govern task ownership and assignment?
- Should task data persist across restarts, and what database constraints are required?
- What is the supported date format and timezone policy?

## Assignment design decisions

The assignment endpoint requires a non-empty string, trims surrounding whitespace, returns `400` for invalid input, returns `404` for an unknown task, and returns the updated task on success. Reassignment is allowed and replaces the existing assignee because the endpoint is an update operation; this behavior is covered by a regression test.

