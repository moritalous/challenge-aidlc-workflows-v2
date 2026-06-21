# Integration Test Instructions — Walking Skeleton

> Status: Draft (awaiting approval gate)
> 境界結合テスト。skeletonは外部(AWS/AI)を注入モックで隔離。

## 結合点と検証
| 結合境界 | テスト | 状態 |
|----------|--------|------|
| API route → Service → Repository | `routes/tasks.test.ts`(12件): ハンドラ→service→fake/mock repo の往復、検証エラーの400マッピング | 実装済 |
| Orchestrator → Parser/Generator/QualityGate/Deployer | `orchestrator.test.ts`(6件): 注入した各段で状態機械の遷移（happy / 非PASS→HaltForHuman / 欠落差し戻し） | 実装済 |
| Repository → DynamoDB | `dynamo-task-repository.test.ts`(6件): モックDocumentClientでQuery/Put/Get、Scan不使用を固定 | 実装済 |
| CDK Stack synth | `app-stack.test.ts`(7件): Template assertionsでリソース/IAM/GSIを検証 | 実装済 |
| App shell → API client → pages | `App.test.tsx`(3件): 注入apiでmount時list、新規作成→refresh、既存編集→update | 実装済 |

## 実AWS結合（後続）
- 実Lambda↔実DynamoDB↔API Gatewayのe2eは ci-pipeline / deployment-execution で staging に対し実施。
- デプロイ後スモーク（`/health`==200/≤5秒）が最小の実結合検証（deploy柱）。

## CLI スモーク（手動/CI）
- `node packages/scaffold-cli/dist/cli.js` で意図→生成→ゲート→（scanner未配備なら）HaltForHuman を確認。状態機械の通し動作を観測。
