# Scalability Requirements — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `requirements.md`(NFR-3/NFR-6), `business-logic-model.md`
> 2層で記述: (A)雛形ツール / (B)生成アプリ。

## (A) 雛形ツールのスケーラビリティ要件

| ID | 観点 | skeleton目標 | 拡張方針 |
|----|------|-------------|----------|
| SCALE-T1 | 同時生成プロジェクト数 | 1（単一ユーザー・逐次実行前提, NFR-6.1） | 後続Boltでジョブキュー化を検討 |
| SCALE-T2 | 意図のエンティティ数 | skeletonは **=1**（Taskのみ）。合否=生成対象が単一エンティティに収まること | `IntentModel.entities` を増やして対応（domain-entities.md） |
| SCALE-T3 | 品質ゲートの柱数 | 4本固定 | 柱は `GateResult.pillar` 列挙の追加で拡張可（U0契約） |

- ツールは個人利用が起点（NFR-6.1）。水平スケールよりも**単一実行の信頼性・再現性**を優先（NFR-4.1）。
- CodeGenProvider 背後のAIモデルは差し替え可能（ADR-004）。スループット要件が出れば Provider 実装側で並列化する。

## (B) 生成アプリ（Task CRUD）のスケーラビリティ要件

| ID | 観点 | skeleton目標 | 根拠 |
|----|------|-------------|------|
| SCALE-A1 | 同時リクエスト | Lambda 自動スケール（既定の同時実行枠内） | サーバーレス既定 |
| SCALE-A2 | データ件数 | DynamoDB オンデマンド課金で件数増に追従 | 単一テーブル設計 |
| SCALE-A3 | 配信 | S3 + CloudFront でフロント静的配信をエッジキャッシュ | ADR-002 |

- スケーリングトリガ/キャパシティプランニングは skeleton では作り込まない（縦スライス疎通が目的）。負荷想定が具体化したら DynamoDB のキャパシティモード・Lambda 同時実行予約を後続Boltで定義。
- 成長投影（具体的なRPS/件数）は performance-validation / 後続Bolt で確定。
