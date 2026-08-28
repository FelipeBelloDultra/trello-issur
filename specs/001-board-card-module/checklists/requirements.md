# Specification Quality Checklist: Board & Card Module (Kanban core)

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-28
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Aggregate boundary (Card as its own aggregate vs. Board owning Column+Card) and card ordering
  strategy (sequential integer vs. fractional/lexorank) were open questions in the old
  `docs/api/specs/006-board-card-module.md`. Both are implementation decisions (HOW), not
  feature scope (WHAT) — intentionally deferred to `/speckit-plan`, not included here.
- The three product-scope open questions from the old spec (board visibility, board-per-workspace
  limit, delete strategy) were resolved inline — see the Clarifications section in spec.md — using
  the existing workspace pattern as precedent (no soft delete, workspace-scoped visibility, no
  plan-tied limit until a billing module exists) rather than left open.
- Post-generation review (2026-08-28, before `/speckit-plan`) found 4 CRUD-completeness gaps and
  fixed them: FR-011 (list a workspace's boards — was create+view only, no listing), FR-012
  (delete a column), FR-013 (delete a card individually, not just via board cascade), FR-014
  (rename/edit a board — `board:edit` exists in RBAC but had no positive requirement). All four
  were reasonable-default additions consistent with the RBAC permission keys already granted
  (`board:edit`) and with the CRUD completeness implied by the other entities.
- All items pass; no further spec updates required before `/speckit-plan`.
