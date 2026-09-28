# Untested API — Objective and Implementation Plan

## Objective

Complete the take-home assignment for the Full Stack Developer Intern application by turning the supplied Express task API into a tested, documented, and production-minded submission.

The finished repository should:

1. Demonstrate understanding of the existing code through focused unit and integration tests.
2. Cover every existing endpoint, including happy paths, validation failures, missing-resource cases, and meaningful boundary conditions.
3. Achieve at least 80% test coverage, with the final coverage summary recorded in the repository.
4. Document bugs discovered through tests, including expected behavior, observed behavior, reproduction/discovery path, location, and a proposed fix.
5. Fix at least one verified bug and include a regression test.
6. Implement `PATCH /tasks/:id/assign` with sensible validation and clear behavior for missing, blank, and already-assigned tasks.
7. Include a concise submission note covering what would be tested next, what was surprising, and what should be clarified before production.
8. Keep the implementation focused: preserve the existing API contract unless a tested bug or the new feature requires a change, and explain any intentional behavior decisions.

## Current codebase understanding

- Stack: Node.js, Express, Jest, Supertest, UUID, in-memory storage.
- Existing API: list/filter/paginate tasks, create, full update, delete, complete, and stats.
- New API required: `PATCH /tasks/:id/assign` with `{ "assignee": "string" }`.
- State is process-local and resets on restart; tests must reset the service state between cases.
- The assignment’s canonical status values are `todo`, `in_progress`, and `done`.
- The README contains a status naming inconsistency (`pending`, `in-progress`, `completed`) that should be called out and resolved in the submission notes rather than silently propagated.

## Working principles

- Test externally observable behavior at the route layer; test business rules and state transitions directly at the service layer.
- Prefer deterministic assertions: validate shapes and invariants rather than exact UUIDs or timestamps.
- Use the existing `_reset()` helper in test setup so tests remain isolated.
- Reproduce suspected bugs with failing tests before changing implementation.
- Keep bug fixes narrow and add regression coverage for each behavior changed.
- Avoid adding dependencies or architectural changes that are not needed for the brief.
- Make design decisions explicit in comments/notes where the assignment leaves behavior open.

## Detailed implementation plan

### 1. Establish a clean baseline

- Work from a personal branch/fork of the supplied repository.
- Install dependencies with `npm install` inside `task-api`.
- Run the existing test command and coverage command to confirm the starting state.
- Inspect the route, service, and validator behavior while recording assumptions and any baseline failures.

### 2. Build service unit tests

Create focused tests for `src/services/taskService.js` covering:

- Empty-store behavior for `getAll`, `findById`, `getByStatus`, pagination, and stats.
- `create` defaults, supplied fields, generated ID, and timestamps.
- Lookup and status filtering behavior.
- Pagination first page, later page, page size, empty page, and boundary values.
- Update success and missing ID behavior.
- Delete success, missing ID behavior, and resulting store state.
- Completion success, missing ID behavior, status transition, completion timestamp, and preservation/change of other fields according to observed contract.
- Stats counts for all statuses and overdue/non-overdue/complete tasks.
- Reset isolation.

Suspected defects will first be captured as tests that express the intended API behavior. The exact bug list will be finalized only after the tests demonstrate it.

### 3. Build route integration tests

Create Supertest tests against the exported Express app. Reset state before each test and cover:

- `GET /tasks`: empty list and populated list.
- `GET /tasks?status=...`: matching results and no matches.
- `GET /tasks?page=...&limit=...`: response shape and page boundaries.
- `GET /tasks/stats`: counts and overdue count.
- `POST /tasks`: valid creation, defaults, invalid title, invalid status/priority, and invalid due date.
- `PUT /tasks/:id`: valid update, invalid update payload, and missing ID.
- `DELETE /tasks/:id`: 204 success, missing ID, and confirmation that the task is gone.
- `PATCH /tasks/:id/complete`: success, missing ID, and resulting task state.
- Consistent response status codes and error bodies for all failure paths.

The tests will also protect the `/tasks/stats` route from being accidentally treated as an `/:id` route.

### 4. Verify and document bugs

After the test suite exposes actual failures or contract inconsistencies, add `BUG_REPORT.md` with one entry per issue:

- Bug title and severity/impact.
- Expected behavior.
- Actual behavior.
- Reproduction or test name.
- Exact source location and root cause.
- Whether it is fixed in this submission; if not, a practical fix proposal.

Likely candidates to verify include page offset calculation, status matching semantics, date validation strictness, completion side effects, and invalid pagination input. These are hypotheses only until confirmed by tests and the assignment contract.

### 5. Fix one verified bug

- Choose the smallest high-confidence bug with clear expected behavior and useful production impact.
- Implement the narrow fix in the service, validator, or route layer as appropriate.
- Add or update a regression test that fails before the fix and passes after it.
- Ensure the fix does not alter unrelated endpoint behavior.
- Record the fix rationale in `BUG_REPORT.md` and the final notes.

The leading candidate is likely pagination if the existing implementation demonstrably skips the first page, but the final choice will be based on evidence from the tests.

### 6. Implement task assignment

Add route and service support for:

`PATCH /tasks/:id/assign`

Planned behavior:

- Accept a JSON body containing `assignee`.
- Require `assignee` to be a string with non-whitespace content.
- Trim surrounding whitespace before storing, so the persisted value is normalized.
- Return the updated task with HTTP 200.
- Return HTTP 404 with the existing error style when the task ID does not exist.
- Return HTTP 400 for missing, non-string, or blank assignees.
- Decide and document already-assigned behavior after reviewing the assignment’s intent and existing API conventions; prefer an explicit, predictable rule rather than silently hiding a reassignment. The selected rule must have tests.
- Preserve all unrelated task fields.

Add both service-level and route-level tests for success, validation failures, missing task, reassignment behavior, and field preservation.

### 7. Coverage, quality, and documentation pass

- Run `npm test` and `npm run coverage`.
- Raise coverage above 80% without low-value assertions or implementation-detail tests.
- Add a committed coverage summary file (for example `COVERAGE.md`) containing the final command and summary table/output.
- Add `SUBMISSION_NOTES.md` covering:
  - What would be tested next with more time.
  - What surprised us in the codebase.
  - Questions to resolve before production.
  - Assignment/README contract inconsistencies and the chosen interpretation.
  - Assignment endpoint design decisions.
- Update the project README only where it improves setup, test, feature, or submission clarity.
- Add comments only where they explain a non-obvious decision or tradeoff; keep code self-explanatory elsewhere.

### 8. Final verification and handoff

- Run the full test and coverage commands from a clean dependency state.
- Manually smoke-test the API or use a short scripted request sequence for the new endpoint and the chosen bug fix.
- Review changed files for accidental edits, debug output, secrets, and inconsistent terminology.
- Check `git diff`, confirm all required deliverables are present, and prepare a concise commit/PR description.
- Deploy only after the implementation is reviewed and approved; then verify the live link and include both Git and live links in the final submission message.

## Definition of done

- [ ] Unit tests cover service behavior.
- [ ] Integration tests cover every endpoint and at least two meaningful edge cases.
- [ ] `npm test` passes.
- [ ] Coverage is at least 80%.
- [ ] A test-discovered bug is documented and one bug is fixed with regression coverage.
- [ ] Assignment endpoint is implemented, validated, and tested.
- [ ] Bug report, coverage summary, and submission notes are committed.
- [ ] README/setup instructions remain accurate.
- [ ] Final review confirms no unrelated or unexplained changes.

## Review checkpoint

Before implementation begins, review and confirm:

1. The interpretation of assignment behavior and the proposed test scope.
2. The planned validation rule for assignment names and the chosen reassignment policy.
3. The likely pagination candidate for the single required bug fix.
4. Whether deployment should target a specific platform or remain a later step after local completion.

