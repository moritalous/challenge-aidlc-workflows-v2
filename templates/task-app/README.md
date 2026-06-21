# task-app (generated-app TEMPLATE)

The thin Task-CRUD vertical slice the scaffold tool generates.

- `api/`  — Hono API on AWS Lambda. `/tasks` CRUD + `/health`. zod validation at
  the boundary (400 on invalid). DynamoDB repository (PK=`id`, no Scan in the hot
  path). `changeStatus` is realized as `PUT /tasks/:id` updating `status`.
- `web/`  — React+Vite UI. LoginPage / TaskListPage / TaskDetailPage / ConfirmDialog
  / StatusBanner / AlertBanner / EmptyState. WCAG AA (landmarks, aria-live
  banners, focus management, color-independent status via icon+label).
- `infra/` — AWS CDK `AppStack`: S3 (block-public) + CloudFront (OAC), HTTP API,
  Lambda (Node 20), DynamoDB (PITR), least-privilege IAM (5 DynamoDB actions
  scoped to the table ARN — no wildcard resources).

```bash
npm run -w @vibe-app/api test
npm run -w @vibe-app/web test
npm run -w @vibe-app/infra test
```
