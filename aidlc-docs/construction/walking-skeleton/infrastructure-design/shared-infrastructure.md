# Shared Infrastructure — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `deployment-architecture.md`, `infrastructure-services.md`, `cicd-pipeline.md`
> Bolt横断で共有する基盤。skeletonは最小限。

## 共有リソース

| リソース | 共有範囲 | skeleton扱い |
|----------|----------|--------------|
| CDK Bootstrap（CDKToolkit） | AWSアカウント/リージョン単位 | `cdk bootstrap` を1回実施。以降Boltで共有 |
| GitHub Actions OIDC Provider + デプロイIAMロール | リポジトリ単位 | 1回作成。CI からの一時クレデンシャル発行に使用（SEC-T5） |
| 状態保管（ProjectStore U1） | ツール実行単位 | skeletonはローカル/ファイル永続。将来S3バックエンド化を検討 |

## 環境戦略（org/team rule: トランクベース）
- トランク=`main`。短命フィーチャーブランチ→squash-merge。
- 環境は staging を1つ（deploy-on-merge）。本番は手動承認で同一トランクからタグ/設定でゲート（長命リリースブランチを作らない）。

## 命名・タグ規約
- アプリトークン `<app>` = `vibe`。リソース名: `<app>-<env>-<resource>`（例: DynamoDBテーブル物理名 `vibe-staging-tasks`、CDKスタックlogical id `AppStack`）。物理名は `Project` 由来で決定的に生成。
- 全リソースに `Project`, `Environment`, `ManagedBy=CDK`, `Bolt` タグを付与（コスト配賦・棚卸し）。

## コスト方針（skeleton）
- すべてサーバーレス/オンデマンドで、アイドル時コストは最小（Lambda/DynamoDB/API Gatewayは従量、S3/CloudFrontは低額）。
- 詳細見積りは後続（aws-pricing 連携）で必要に応じ実施。

## セキュリティ共有設定
- アカウントレベルの S3 パブリックアクセスブロック、デフォルト暗号化を前提。
- IAM はリソースごと最小権限（ワイルドカード禁止, SEC-A4）。インフラ変更はセキュリティレビュー対象（operation phase ルール、本番化時に適用）。
