# RAID Log — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> RAID = Risks, Assumptions, Issues, Dependencies
> Upstream: `feasibility-assessment.md`, `constraint-register.md`

## Risks（リスク）

| ID | リスク | 影響度 | 発生度 | 緩和策 |
|----|--------|--------|--------|--------|
| R-1 | AI生成コードの品質ばらつきがゲートで吸収しきれない | 高 | 中 | fail-closedゲート＋テスト強制＋人の最終承認ポイントを設計（design/construction） |
| R-2 | スコープクリープ（複数アプリ形態を欲張る） | 中 | 高 | まずフルスタックTS 1構成のwalking skeletonに集中 |
| R-3 | AIモデル/ツール領域の急変で雛形が陳腐化 | 中 | 中 | モデル/ツールを差し替え可能な抽象境界で疎結合化 |
| R-4 | 生成物のセキュリティ欠陥（脆弱性/シークレット混入） | 高 | 中 | 依存スキャン・シークレット検出・SAST・入力検証を標準ゲート化(RC-1) |
| R-5 | 「完全AI生成」と「品質保証」の緊張で速度が落ちる | 中 | 中 | ゲートを高速・自動化し開発体験を損なわない設計（CI最適化） |

## Assumptions（前提）

| ID | 前提 | 検証タイミング |
|----|------|----------------|
| A-1 | 既製AIモデル/エージェントで本番品質コードを生成可能 | construction（実証） |
| A-2 | TSフルスタック＋AWSサーバレスが代表構成として妥当 | scope/infra-design |
| A-3 | fail-closed品質ゲートが採用の障壁にならない（むしろ価値） | 採用KPIで検証 |
| A-4 | 個人利用の使いやすさが将来のチーム横展開の土台になる | operation/横展開 |

## Issues（現時点の課題）

| ID | 課題 | 対応 |
|----|------|------|
| I-1 | 雛形の提供形態が未確定 | scope-definitionで決定 |
| I-2 | 品質ゲートの定量合格基準が未定義 | requirements-analysis / nfr-requirements |

## Dependencies（依存）

| ID | 依存先 | 種別 |
|----|--------|------|
| D-1 | 外部AIモデル/エージェントAPI | 外部サービス |
| D-2 | CIプラットフォーム（例: GitHub Actions） | 外部サービス |
| D-3 | セキュリティスキャナ群（脆弱性/シークレット/SAST） | 外部ツール |
| D-4 | AWSアカウント・サーバレス基盤 | クラウド基盤 |
| D-5 | スターター基盤・OSSライブラリ群 | OSS依存 |

<!-- Text fallback: Risks5件(生成品質/スコープクリープ/陳腐化/セキュリティ欠陥/速度低下)、Assumptions4件、Issues2件(提供形態未定/ゲート基準未定)、Dependencies5件(AIモデル/CI/スキャナ/AWS/OSS)。 -->
