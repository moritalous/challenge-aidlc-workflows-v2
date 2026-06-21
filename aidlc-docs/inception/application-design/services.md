# Services (Deployable Units) — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Upstream: `components.md`, `decisions.md`(ADR-002)
> Service = デプロイ可能なプロセス/ユニット。

## (A) 雛形ツールのService

| Service | 形態 | 内容 | 配布 |
|---------|------|------|------|
| aidlc-app CLI | ローカルCLIプロセス（npm配布） | TC-1〜TC-12 を内包する単一CLI | `npm create aidlc-app` / `npx` |

> ツールはローカル実行。AWSへはCDK経由で生成アプリをデプロイする（ツール自体はクラウド常駐不要）。

## (B) 生成アプリのService（AWSサーバレス, ADR-002）

| Service | AWSリソース | 役割 |
|---------|-------------|------|
| Frontend (静的配信) | S3 + CloudFront | React+Viteビルド成果物の配信 |
| API | API Gateway + Lambda(Hono) | CRUD API、入力検証 |
| Data | DynamoDB | Taskデータ永続化 |
| (将来)Auth | Cognito | 本格認証（B-8, 今回スコープ外） |

## デプロイ構成（概念図）

```
                 +-------------------+
   (User) -----> | CloudFront + S3   |  Frontend(React/Vite)
                 +---------+---------+
                           | /api/*
                 +---------v---------+
                 | API Gateway       |
                 +---------+---------+
                           |
                 +---------v---------+      +-------------+
                 | Lambda (Hono API) |----->| DynamoDB    |
                 +-------------------+      +-------------+
   IaC: AWS CDK が上記を一括プロビジョニング（FR-4, fail-closedのデプロイ柱）
```
<!-- Text fallback: 生成アプリは CloudFront+S3(フロント) → API Gateway → Lambda(Hono) → DynamoDB。AWS CDKで一括プロビジョニング。Authは将来Cognito。 -->

## 環境・デプロイ方針（team-practices準拠）
- マージで staging へ自動デプロイ、本番は手動承認ゲート（team-practices Deployment）。
- デプロイ柱（TC-6d/TC-9）が CDK deploy＋ヘルスチェックで「実際に動く」ことを検証（NFR-1.3）。
- 失敗時は CDK のロールバック/破棄で安全側へ（FR-4.4, operation phaseルール）。

## デプロイ時間予算の前提（NFR-3関連, finding-2）
- **CloudFront初回ディストリビューション作成は時間予算（ゲート≤5分/1回転≤15分）の対象外**とみなす（伝播に数分〜十数分かかりうるため）。デプロイ柱のヘルスチェックは、初回はオリジン（API Gateway/Lambda）直叩きでの疎通確認を優先し、CloudFront経由の最終確認は非同期に許容する。
- 2回目以降は差分(update)デプロイ前提で時間予算内に収める。最終的な時間目標は performance-validation で確定。

## NFR配置
- コスト最小化: 全てサーバレス従量（aws-platform視点、初期コスト小）。自動修正の反復デプロイは差分updateで抑制。
- スケール: Lambda/DynamoDBのオートスケール。詳細は nfr-design / infrastructure-design。
