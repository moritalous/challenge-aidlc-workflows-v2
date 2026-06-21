# Performance Requirements — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `requirements.md`(NFR-3), `business-logic-model.md`, `business-rules.md`
> 2層で記述: (A)雛形ツール / (B)生成アプリ。暫定値は performance-validation で最終確定。

## (A) 雛形ツールの性能要件

| ID | 指標 | 目標（暫定） | 典拠 | 測定方法 |
|----|------|-------------|------|----------|
| PERF-T1 | 1回転（意図→生成→4柱ゲート→デプロイ）の総ツール実行時間 | ≤ 15分（人手待ち除く） | NFR-3.1 | CLI開始〜デプロイ完了のwall-clock計測（CodeGen/AWS呼び出し含む） |
| PERF-T2 | 品質ゲート1回評価（自動修正除く）の実行時間 | ≤ 5分 | NFR-3.2 | 4柱を並列起動した場合の最遅柱の完了まで |
| PERF-T3 | 意図解析(Parsing)の応答 | ≤ 60秒 | NFR-3.1派生 | CodeGenProvider呼び出し1回のレイテンシ |

- 4柱ゲートは**並列実行**を既定とする（直列だと PERF-T2 を満たしにくい）。柱間に依存はない（BR-T1 はAND合成・順序非依存）。
- CodeGenProvider 呼び出しはレイテンシ支配的。リトライ/タイムアウト上限を設け、無限待ちを禁止（construction phase: 統合境界のエラーハンドリング）。
- skeletonでは自動修正(U6)を含まないため、NFR-3.3（自動修正1試行の時間上限）は後続Boltで確定（本stageでは対象外）。

## (B) 生成アプリ（Task CRUD）の性能要件

| ID | 指標 | 目標（暫定） | 典拠 | 測定方法 |
|----|------|-------------|------|----------|
| PERF-A1 | API 応答（GET/POST/PUT/DELETE /tasks） p95（warmパス） | ≤ 500ms | NFR-3派生 | 定常負荷下のwarmパスで p95 計測。コールドスタートは別指標として performance-validation で確定 |
| PERF-A2 | ヘルスチェック応答 | HTTP 200 / ≤ 5秒 | FR-4.2 / NFR-1.3 | デプロイ後スモークテスト |
| PERF-A3 | フロント初期表示（一覧） | ≤ 2.5秒（LCP, 標準回線） | NFR-5派生 | Lighthouse / Playwright計測 |

- DynamoDB は単一テーブル・PK=`id` のため読み書きは定数時間想定。skeletonでは1リソース・低件数。
- Lambda コールドスタート影響を p95 に織り込む（Hono は軽量・初期化コスト小）。

## ベンチマーク方針
- 暫定値はすべて performance-validation stage で実測し最終確定する（NFR-3 の「未確定」項目）。
- skeletonの目的は縦スライスの疎通確認であり、性能の作り込みは後続Boltに委ねる。
