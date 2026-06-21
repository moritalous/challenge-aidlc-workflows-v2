# Tech Stack Decisions — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `decisions.md`(ADR-002/004/005), `application-design`, `requirements.md`
> 本stageは application-design で確定したスタック（ADR-002）を NFR 観点で追認・正当化する。新規決定ではなく根拠の固定。

## 確定スタック（ADR-002 / project-learnings c-application-design）

| レイヤ | 選定 | NFR上の正当化 |
|--------|------|--------------|
| フロント | React + Vite（S3 + CloudFront配信） | エコシステム成熟・a11y(NFR-5)実装容易・エッジ配信で初期表示(PERF-A3) |
| API | Hono on AWS Lambda + API Gateway | 軽量でコールドスタート小(PERF-A1)・TypeScript統一・サーバーレスでSCALE-A1 |
| DB | DynamoDB（単一テーブル PK=id） | マネージド冗長(REL-A4)・オンデマンドで件数追従(SCALE-A2) |
| IaC | AWS CDK（TypeScript） | 言語統一・型付きインフラ・差分デプロイ冪等性(REL-T3) |
| 言語 | TypeScript 統一（全レイヤ） | 単一型システムで保守性(NFR-4.2)・型チェック柱を全層に適用 |

## 品質ゲートツール（4本柱）

| 柱 | ツール | 合格条件 | 典拠 |
|----|--------|----------|------|
| テスト | Vitest（単体/結合）+ Playwright（E2E） | カバレッジ ≥80%・全緑 | NFR-1.1 |
| 静的解析/型 | tsc + ESLint + Prettier | 型/Lintエラー0・フォーマット100% | NFR-1.2 |
| セキュリティ | npm audit + Trivy + gitleaks + Semgrep | High/Critical=0・シークレット=0・SAST High=0 | NFR-2.1 |
| デプロイ可能性 | GitHub Actions（CI）→ AWS実デプロイ + ヘルスチェック | CI緑＋HTTP200/5秒 | NFR-1.3 |

- 4柱は fail-closed の AND 合成（BR-T1）。GitHub Actions 上で必須ゲートとしてマージ/進行をブロック（project Mandated）。

## AIモデルの隔離（ADR-004）

- コード生成AIは `CodeGenProvider` インターフェース背後に隔離し**差し替え可能**とする。
- 利点（NFR上）: モデル進化への追従(NFR-4)・テスト時のモック差し替え容易(NFR-1.1)・ベンダーロックイン回避。
- Provider 実装は認証情報を環境変数経由でのみ受け取る（SEC-T5）。

## スコープ注
- 本 skeleton は上記スタックの**薄い1リソース縦スライス**を実証する。スタックの追加要素（認証基盤・キャッシュ層・監視基盤）は後続Boltで段階導入。
- 暫定の性能目標値（PERF-T1/T2、NFR-3系）は performance-validation で最終確定。
