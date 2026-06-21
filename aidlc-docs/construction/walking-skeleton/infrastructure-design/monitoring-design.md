# Monitoring Design — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `nfr-design/reliability-design.md`(REL-A1), `reliability-requirements.md`
> SLO/メトリクス/アラートの設計。実装詳細は observability-setup(operation phase)で確定。

## SLO（REL-A1）

| SLO | 目標 | ウィンドウ | 測定 |
|-----|------|-----------|------|
| 可用性 | **99.9%** | 30日ローリング | API Gateway 5xx率の補数 |
| レイテンシ | p95 ≤ 500ms（warm） | 30日ローリング | API Gateway/Lambda Duration |

## メトリクス（各サービス最低1つの健全性＋エラー率）

| サービス | 健全性メトリクス | エラー率メトリクス |
|----------|------------------|---------------------|
| Lambda(Hono) | Invocations, Duration | Errors, Throttles |
| API Gateway | Count, IntegrationLatency | 5XXError, 4XXError |
| DynamoDB | ConsumedRead/WriteCapacity | ThrottledRequests, SystemErrors |
| CloudFront | Requests | TotalErrorRate |

## アラート閾値（SLO違反より手前, operation phase ルール準拠）

| アラート | 閾値（SLO breach前に発火） | 根拠 |
|----------|---------------------------|------|
| API 5xxエラー率 | 5分間で > **1%**（SLO 99.9%=0.1%許容より手前） | 早期検知で remediation 時間確保 |
| Lambda エラー | 5分間で > 1件かつ増加傾向 | 障害の早期把握 |
| p95レイテンシ | 5分間 p95 > 500ms | PERF-A1 逸脱検知 |
| ヘルスチェック | `/health` 非200 | REL-A2 / デプロイ柱 |

> 注: API 5xx>1%/5分 は**短ウィンドウのfast-burn早期警報**であり、0.1%/30日のエラーバジェット（SLO 99.9%）を緩めるものではなく補完する。multi-window burn-rate の調整は observability-setup で確定。

## ログ
- Lambda は構造化ログ(JSON)を CloudWatch Logs へ。秘匿情報を出力しない（SEC-T5）。
- ログ保持14日（skeleton。長期保持は後続）。

## スコープ注
- ダッシュボード・トレーシング(X-Ray)・PagerDuty連携等の具体実装は **observability-setup(operation phase)** で確定。本stageは閾値方針とメトリクス対象の宣言に留める。
- 本番SLO・エスカレーション連絡先は incident-response(operation phase)で定義。
