# Scalability Design — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `nfr-requirements/scalability-requirements.md`, `tech-stack-decisions.md`

## (A) 雛形ツールのスケーラビリティ設計

| 要件 | 設計 |
|------|------|
| SCALE-T1（同時生成=1） | skeletonは単一プロセス逐次実行。状態は `ProjectStore`(U1)にファイル/ローカル永続。将来のキュー化は Provider 層の差し替えで対応 |
| SCALE-T2（=1エンティティ） | `IntentModel.entities.length === 1` を skeleton の前提。拡張は契約値の追加（domain-entities） |
| SCALE-T3（4柱固定） | `GateResult.pillar` 列挙で柱を表現。柱追加は列挙拡張＋ゲート合成への1行追加で水平拡張 |

- 設計方針: 水平スケールより**単一実行の再現性**（NFR-4.1）を優先。Provider/Store はインターフェース越しで、将来の分散化に備える。

## (B) 生成アプリのスケーラビリティ設計

| 要件 | 設計 |
|------|------|
| SCALE-A1（同時リクエスト） | Lambda の自動スケール。skeletonは予約同時実行を設定せず既定枠 |
| SCALE-A2（データ件数） | DynamoDB **オンデマンド課金**モードで件数増に自動追従。ホットパーティション回避のためPKは高カーディナリティの`id`(UUID) |
| SCALE-A3（配信） | S3 オリジン + CloudFront ディストリビューション。静的アセットはエッジキャッシュ、APIは別オリジン |

```
[Browser] → [CloudFront] →(static)→ [S3]
                         →(/api/*)→ [API Gateway] → [Lambda(Hono)] → [DynamoDB]
```
<!-- Text fallback: CloudFrontが静的をS3から、/api/* をAPI Gateway→Lambda→DynamoDB へルーティング。 -->

## スケーリングトリガ（後続）
- 具体的なRPS/件数の成長投影と DynamoDB キャパシティモード切替・Lambda 予約同時実行は performance-validation / 後続Bolt で確定（skeletonでは作り込まない）。
