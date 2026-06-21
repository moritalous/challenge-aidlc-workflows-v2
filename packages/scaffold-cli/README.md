# @vibe/scaffold-cli (the TOOL)

intent → AI-generate → 4-pillar fail-closed quality gate → AWS deploy.

## Units

| Module | Unit | Responsibility |
|--------|------|----------------|
| `intent/parser.ts` | U2 | parse text → `IntentModel`; `MissingIntentError` on empty intent; retains `changeStatus` |
| `gen/provider.ts` + `gen/template-provider.ts` + `gen/generator.ts` | U3 | `CodeGenProvider` seam (ADR-004, AI-model-swappable) → `Project` |
| `gate/evaluate.ts` | U4 | fail-closed `evaluate()` (length===4 && every PASS) |
| `gate/quality-gate.ts` | U4 | parallel pillar runners (`Promise.allSettled` + timeout → ERROR) |
| `store/project-store.ts` | U1 | persist/load projects (JSON) |
| `deploy/deployer.ts` | U5 | idempotent `cdk deploy` + `/health` smoke (injectable) |
| `orchestrator.ts` + `cli.ts` | U7 | state machine; non-PASS → **HaltForHuman** (no auto-fix) |

## HaltForHuman (no U6)

A non-PASS gate stops once and prints failing pillars + reasons. There is no
retry, no counter, no escalation — those are U6 (a later Bolt).

## External calls are injectable

`cdk`, the `/health` smoke check, the AI provider, and every pillar runner are
injected, so the unit tests never touch the network or AWS.

```bash
npm run -w @vibe/scaffold-cli start -- "a task app with create update delete and status change"
```
