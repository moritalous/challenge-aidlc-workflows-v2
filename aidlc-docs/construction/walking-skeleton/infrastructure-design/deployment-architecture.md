# Deployment Architecture — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `nfr-design/*`, `application-design/components.md`, `tech-stack-decisions.md`
> AWS CDK(TypeScript)で定義する。skeletonは単一スタック・単一リソース。

## 全体構成

```
[ユーザー] → HTTPS → [CloudFront] ─(default)→ [S3: React静的アセット(OAC)]
                                  └(/api/*)──→ [API Gateway(HTTP API)] → [Lambda(Hono)] → [DynamoDB: Tasks]
                                                                              │
                                                                  [CloudWatch Logs/Metrics]
```
<!-- Text fallback: CloudFrontがデフォルトはS3(React, Origin Access Control)、/api/* はAPI Gateway HTTP API→Lambda(Hono)→DynamoDB(Tasks)へ。LambdaはCloudWatchへログ/メトリクス出力。 -->

## スタック構成（CDK）

| スタック | 含むリソース | 備考 |
|----------|--------------|------|
| `AppStack`（skeleton単一） | S3 bucket, CloudFront distribution(OAC), HTTP API Gateway, Lambda(Hono), DynamoDB table, IAM roles, Log groups | `Project.iacEntry` が指すCDKエントリ（U8所有） |

- 環境はまず `staging` の1環境（org rule: deploy-on-merge to staging）。本番は別途手動承認ゲート（後続Bolt）。
- リージョンは `us-east-1`（CloudFront ACM証明書要件）。

## デプロイフロー（REL-T3 / BR-T6 冪等）

```
cdk deploy AppStack
  → CloudFormation 差分(change set)適用（フル作成しない, BR-T6）
  → デプロイ後スモーク: GET /health == 200 / ≤5秒（FR-4.2, deploy柱）
  → 非200ならデプロイ柱=FAIL（fail-closed）
失敗時: CloudFormation 自動ロールバック＋手順を GateResult.details に提示（FR-4.4）
```

## セキュリティ境界（SEC-A4/A5）
- S3 は CloudFront OAC 経由のみ（直接公開しない・パブリックアクセスブロック）。
- API Gateway / CloudFront は HTTPS のみ。
- Lambda 実行ロールは Tasks テーブルへの最小CRUD権限のみ（infrastructure-services 参照）。

## ロールバック手順
1. `cdk deploy` 失敗 → CloudFormation がスタックを直前の安定状態へ自動ロールバック。
2. 手動復旧時は `cdk deploy --rollback` または前リビジョンの再デプロイ（差分）。
3. 手順とエラー要約をツールが提示（人手前提, BR-T1'）。
