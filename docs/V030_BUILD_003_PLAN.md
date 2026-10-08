# Scorecard Studio v0.3.0 — Build 003 Normalized-Model Design Plan

**Plan source:** Build 002 closure  
**Prepared:** 2026-10-06  
**Starting application baseline:** committed Scorecard Studio v0.2.0  
**Source-policy authority:** `docs/V030_SOURCE_ADOPTION_DECISIONS.md`

## 1. Objective

Build 003 converts the evidence-backed source policy into an implementable, versioned normalized-model contract. It separates source request outcomes, normalized data, value availability, provenance, adapter capability, compatibility, and persistence concerns before production request orchestration changes.

Build 003 is contract design and executable contract validation. It does not authorize unrelated UI/catalog work or opportunistic application rewrites.

## 2. Guardrails

1. Preserve the committed v0.2.0 application as the behavioral control until an implementation increment explicitly changes it.
2. Use normalized schema version `2`; retain schema version `1` as the v0.2.0 compatibility input, not as the new contract.
3. Keep schema version separate from the human-readable contract revision.
4. Preserve raw source status/scope and selected-value provenance without storing complete raw responses in the normalized model.
5. Keep fetch planning, normalization policy, and selected provenance as separate layers.
6. Do not carry the overloaded `gamePack` label into schema version 2.
7. Do not collapse unposted, empty, omitted, unsupported, ambiguous, partial, failed, stale, and not-requested states.
8. Model spring, regular season, postseason, and MiLB context explicitly.
9. Preserve one player identity across independent legitimate role views; do not globally deduplicate two-way players.
10. Require deterministic contract tests before production adapters target schema version 2.

## 3. Increment plan

### Build 003.1 — Versioned Model and Provenance Contract

- Define schema version 2 root and domain containers.
- Define competition, game-state, source-result, effective-cutoff, availability, and lineage records.
- Define a sidecar lineage mechanism that preserves existing readable data paths.
- Provide a machine-readable JSON Schema and mixed-cutoff Game 2 contract fixture.
- Validate source references, lineage targets, availability vocabulary, and the absence of `gamePack`.

### Build 003.2 — Adapter and Capability Contracts

- Define typed request inputs, response envelopes, and normalized candidate outputs for each accepted adapter.
- Separate adapter execution outcome from concept availability.
- Define capability gating by sport/game type and partial People chunk behavior.
- Define deterministic request keys and freshness inputs.

### Build 003.3 — Compatibility and Migration Map

- Map schema version 1 paths and executable registry fields to schema version 2.
- Decide temporary aliases, compatibility projections, and removed/deferred containers.
- Define persistent snapshot/cache migration and invalidation rules.

### Build 003.4 — Contract Fixtures and Implementation Plan

- Add representative schema version 2 fixtures for ordinary pregame, missing lineup, Game 2 mixed cutoffs, two-way roles, manager ambiguity, variable officials, MiLB capability absence, and scoped competition statistics.
- Convert source precedence and invariants into executable contract tests.
- Produce the ordered production implementation plan.

## 4. Build 003 closure criteria

- The machine-readable model contract matches the documented source policy.
- Every source adapter has explicit inputs, outputs, capability, outcome, cache-key, and freshness semantics.
- Every current executable field has an intentional schema version 2 target or compatibility disposition.
- Mixed-source and mixed-cutoff values remain auditable.
- Persisted data cannot be confused across schema versions or semantically different request scopes.
- Production implementation can proceed in bounded increments without rediscovering source semantics.

## 5. Closure status

**Closed:** Build 003.4, 2026-10-07

All closure criteria are satisfied:

- Build 003.1 defined the versioned model, provenance, availability, and mixed-cutoff contract.
- Build 003.2 defined every adapter, semantic request key, capability rule, freshness trigger, and partial-failure boundary.
- Build 003.3 mapped all 223 executable/compatibility fields and defined safe persistence/version behavior.
- Build 003.4 added the complete eight-scenario fixture suite, executable cross-scenario invariants, and ordered production implementation plan.

Production work begins with Build 004.1. Build 003 changed no production application code or `README.md`.
