# @vibe/contracts (U0)

The stable U0 contract every other unit depends on. Dependency-free, so the
dependency graph stays acyclic.

- `IntentModel` — entities, screens, operations. `operations` **includes
  `changeStatus`** (U0 invariant; realized downstream as a plain `update`).
- `GateResult` / `Pillar` / `GateStatus` — the four-pillar gate types. `PENDING`
  and `ERROR` are non-PASS.
- `Project` / `GenOutput` / `Traceability` — generated-project carrier +
  intent→filePaths traceability (owned by U3's `GenOutput`).

Build: `npm run -w @vibe/contracts build`.
