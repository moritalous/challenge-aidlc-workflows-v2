# CI Configuration — Walking Skeleton

> Status: Draft (awaiting approval gate)
> 実体: `.github/workflows/ci.yml`（GitHub Actions）
> 上流: build-test-results.md, infrastructure-design/cicd-pipeline.md, team WoW(trunk/squash/deploy-on-merge)

## トリガ
- `pull_request` → main: 4本柱を実行（マージ前ゲート）。
- `push` → main: 4本柱 + staging自動デプロイ（deploy-on-merge, team rule）。

## ジョブ構成
| ジョブ | 柱 | 内容 |
|--------|----|----|
| `test` | テスト | `npm run test:coverage`（node, ≥80%）＋ `npm -w @vibe-app/web test --coverage`（jsdom, ≥80%） |
| `static` | 静的/型 | `tsc`（全workspace）＋ ESLint ＋ Prettier --check |
| `security` | セキュリティ | `npm audit --omit=dev --audit-level=high` ＋ gitleaks ＋ Trivy(HIGH/CRITICAL) ＋ Semgrep(p/typescript) |
| `deploy-validate` | デプロイ | `npm run build` ＋ `cdk synth`（テンプレート検証、デプロイなし） |
| `quality-gate` | 合成 | 4柱の `needs` AND。全PASSでのみ通過（fail-closed） |
| `deploy-staging` | デプロイ実行 | `quality-gate` 後・main push時のみ。OIDCでIAMロール引受→`cdk deploy`→`/health`スモーク |

## セキュリティ/認証
- AWS認証は **OIDC**（`id-token: write`）でロール引受。長期キー不保持（SEC-T5）。`secrets.AWS_DEPLOY_ROLE_ARN` を使用。
- `concurrency` で同一refの古い実行をキャンセル。`permissions: contents: read` を既定に最小化。

## 本番デプロイ
- 本workflowは staging まで。**本番は別途手動承認ゲート**（GitHub Environment protection / 別workflow）で実施（org/team rule）。

## 必要なリポジトリ設定（外部環境での実行時）
- Secrets: `AWS_DEPLOY_ROLE_ARN`（OIDC信頼済みロール）。Variables: `STAGING_HEALTH_URL`。
- Branch protection で `test`/`static`/`security`/`deploy-validate`/`quality-gate` を **required status checks** に設定（quality-gates.md）。
