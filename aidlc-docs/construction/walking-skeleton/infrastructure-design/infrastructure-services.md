# Infrastructure Services — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `deployment-architecture.md`, `nfr-design/security-design.md`, `scalability-design.md`

各AWSサービスの構成。CDK(TypeScript)で記述。

## サービス一覧

| サービス | 用途 | skeleton構成 | 典拠NFR |
|----------|------|--------------|---------|
| **S3** | React静的アセット配信元 | 単一バケット、パブリックアクセス全ブロック、OAC経由のみ | SEC-A5, SCALE-A3 |
| **CloudFront** | エッジ配信・HTTPS終端 | 1ディストリビューション、default→S3 / `/api/*`→APIGW、TLS必須 | PERF-A3, SCALE-A3 |
| **API Gateway** | HTTP API（REST薄め） | `$default` ステージ、CORS制限、Lambdaプロキシ統合 | SEC-A1 |
| **Lambda** | Hono APIランタイム | Node.js 20.x、メモリ512MB（暫定）、タイムアウト10秒 | PERF-A1 |
| **DynamoDB** | Taskストア | テーブル`Tasks`、PK=`id`(S)、オンデマンド課金、PITR有効 | SCALE-A2, REL-A4 |
| **CloudWatch** | ログ/メトリクス | Lambda Log Group(保持14日)、基本メトリクス | observability(後述) |
| **IAM** | 最小権限ロール | Lambda実行ロール（下記） | SEC-A4 |

## IAM 最小権限（SEC-A4）

```
Lambda実行ロール(TasksApiRole):
  - dynamodb:GetItem, PutItem, UpdateItem, DeleteItem, Query  on  arn:.../table/Tasks
  - logs:CreateLogStream, PutLogEvents  on  arn:aws:logs:<region>:<acct>:log-group:/aws/lambda/<fn>:*
  （logs:CreateLogGroup はCDKマネージドポリシーが付与。ワイルドカードresource禁止、ARNに限定）
```

- `changeStatus` は `update`(PUT)で実現されるため `UpdateItem` で充足（domain-entities F2注と整合）。

## 設定値（環境変数注入, SEC-A3）
- `TABLE_NAME`（Tasksテーブル名）、`AWS_REGION` は Lambda 環境変数で注入。コードにハードコードしない。
- シークレット（将来の認証キー等）は AWS Secrets Manager 参照（skeletonでは不使用）。

## DynamoDB 詳細
- 単一テーブル設計、PK=`id`(UUID)で高カーディナリティ → ホットパーティション回避（SCALE-A2）。
- スキャン操作は使用しない（一覧は当面 `Scan` ではなく件数前提で `Query`/全件取得の薄い実装、後続で GSI 検討）。
- Point-in-Time Recovery 有効でデータ保護（REL-A4）。
