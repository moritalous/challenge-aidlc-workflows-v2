# Vibe Scaffold — Walking Skeleton

A two-layer AI-DLC walking skeleton:

- **(A) The scaffold TOOL** (`packages/*`): a CLI that runs
  **intent → AI-generate → 4-pillar fail-closed quality gate → AWS deploy**.
- **(B) The generated-app TEMPLATE** (`templates/task-app/*`): a thin Task-CRUD
  vertical slice — React+Vite web, Hono-on-Lambda API, DynamoDB, AWS CDK infra.

Everything is TypeScript (strict), ESLint+Prettier clean, with Vitest tests.

## Layout

```
packages/
  contracts/        @vibe/contracts     U0 contract: IntentModel, GateResult, Project, GenOutput
  scaffold-cli/     @vibe/scaffold-cli  The TOOL: parser(U2), generator(U3), quality-gate(U4),
                                        deployer(U5), project-store(U1), orchestrator(U7), CLI
templates/task-app/
  api/              @vibe-app/api       Hono Task-CRUD API on Lambda + DynamoDB
  web/              @vibe-app/web       React+Vite UI (WCAG AA)
  infra/            @vibe-app/infra     AWS CDK AppStack
```

## The fail-closed quality gate (core invariant)

`evaluate(results)` (in `packages/scaffold-cli/src/gate/evaluate.ts`):

```ts
passed = results.length === 4 && results.every((r) => r.status === 'PASS');
next   = passed ? 'Deploying' : 'HaltForHuman';
```

- The four pillars are **test / static / security / deploy**.
- `PENDING` and `ERROR` are **non-PASS** — a pending or crashed scanner is never
  shown as a pass.
- Partial pass (some of 4) is a **fail**. Order-independent.
- Pillars run in parallel via `Promise.allSettled` with a per-pillar timeout; a
  timeout or throw normalizes to an `ERROR` GateResult (non-PASS).

### U6 auto-fix is OUT OF SKELETON SCOPE

The skeleton does **not** auto-fix. A non-PASS gate routes to **`HaltForHuman`**,
which stops **once** and prints the failing pillars + reasons (BR-T1'). The
auto-fix loop, the 3-try counter, and the 3-way escalation are unit **U6**, a
later Bolt — they are intentionally absent here.

## changeStatus (U0 invariant)

`IntentModel.operations` includes `changeStatus` per the U0 contract. In the
generated app it is realized as a plain `update` (PUT) of the `status` field —
there are no dedicated transition rules or transition UI in the skeleton.

## Commands

```bash
npm install            # install all workspaces

npm run build          # build every package (tsc)
npm run typecheck      # type-check every package
npm run lint           # ESLint across the repo
npm run format:check   # Prettier check

npm test               # run tool + api + infra tests (node env)
npm run -w @vibe-app/web test   # run web tests (jsdom env)
npm run test:coverage  # coverage (80% line floor, team rule)
```

Run the tool CLI:

```bash
npm run -w @vibe/scaffold-cli start -- "a task app with create, update, delete and status change"
```

## Deploy (generated app)

```bash
npm run -w @vibe-app/api build       # bundle the Lambda code to api/dist
npm run -w @vibe-app/web build       # build the static site to web/dist
npm run -w @vibe-app/infra build
npm run -w @vibe-app/infra synth -- -c env=staging
npm run -w @vibe-app/infra deploy -- -c env=staging
```

Deploy is idempotent (CDK diff/update, not full recreate). After deploy, the
deployer smoke-checks `GET /health` expecting `200` within 5s; failure makes the
`deploy` pillar non-PASS and surfaces rollback steps.

## Security / secrets

No credentials or secrets are hardcoded anywhere. `TABLE_NAME` and `AWS_REGION`
are injected as Lambda env vars; AWS creds flow through the standard credential
chain. IAM is least-privilege: the Lambda role gets exactly five DynamoDB actions
scoped to the Tasks table ARN — no wildcard resources (asserted by the infra
test).
