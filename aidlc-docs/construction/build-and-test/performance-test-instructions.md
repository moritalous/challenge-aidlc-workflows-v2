# Performance Test Instructions — Walking Skeleton

> Status: Draft (awaiting approval gate)
> 暫定目標は performance-validation(operation phase)で最終確定。

## 対象指標（performance-requirements 由来）
| ID | 指標 | 暫定目標 | 計測方法 |
|----|------|---------|----------|
| PERF-T2 | 品質ゲート1評価（自動修正除く） | ≤ 5分 | 4柱を並列起動した最遅柱の完了まで（CLI計測） |
| PERF-T1 | 1回転（意図→生成→ゲート→デプロイ） | ≤ 15分 | CLI開始〜デプロイ完了の wall-clock |
| PERF-A1 | API p95（warmパス） | ≤ 500ms | API Gateway/Lambda の CloudWatch Duration p95（定常負荷） |
| PERF-A2 | ヘルスチェック | 200 / ≤5秒 | デプロイ後スモーク |
| PERF-A3 | フロント初期表示(LCP) | ≤ 2.5秒 | Lighthouse / Playwright |

## skeletonでの扱い
- 本Boltは縦スライス疎通が目的。性能の作り込み・実測確定は performance-validation 段に委譲。
- ゲートの並列実行（Promise.allSettled）と各柱タイムアウトは PERF-T2 達成のための構造として実装済み。
- コールドスタートは warm p95 と分離して計測（performance-requirements PERF-A1 測定方法準拠）。

## 実行（後続段）
```bash
# 例: API負荷（performance-validation段で実施）
#   k6 / artillery で /tasks を一定RPS、p95 を CloudWatch と突合
```
