# Constraint Register — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Upstream: `intent-statement.md`, `build-vs-buy.md`, `feasibility-assessment.md`

制約を技術・組織・規制の3区分で登録する。各制約は後続ステージ（scope/design/infra/nfr）で参照される。

## 技術的制約 (Technical)

| ID | 制約 | 影響 | 出所 |
|----|------|------|------|
| TC-1 | ソースコードは完全にAI生成を前提とする | 人手前提の設計を排し、AIが従いやすい型・明示的合格基準が必須 | intent Q（前提） |
| TC-2 | 技術スタックはモダンTypeScriptフルスタックを既定 | スタック固有のツール選定に収斂（competitive-analysis 層2を土台） | intent Q7 |
| TC-3 | 本番デプロイ先はAWS（サーバレス志向） | IaC・サービス選定はAWS前提（最終確定はinfra-design） | intent Q7 / aws-platform |
| TC-4 | 品質ゲートは fail-closed（不合格なら進行不可） | CI設計・ゲート統合が中核要件 | feasibility-assessment |
| TC-5 | 対象アプリ形態はフルスタック(フロント+API+DB) | まず1構成に集中、拡張は段階的 | intent Q6 |

## 組織的制約 (Organizational)

| ID | 制約 | 影響 | 出所 |
|----|------|------|------|
| OC-1 | 一次利用者は個人/少人数、将来チーム横展開 | 「個人が使いやすい」と「チーム再現性」の両立設計 | intent Q2/F2 |
| OC-2 | 主要KPIは採用・再利用数 | 雛形の使いやすさ・ドキュメント・再現性が成功要因 | intent Q5 |
| OC-3 | 市場スピードがトリガー | 早期にwalking skeletonを出す必要 | intent Q4 |

## 規制・セキュリティ制約 (Regulatory / Security)

| ID | 制約 | 影響 | 出所 |
|----|------|------|------|
| RC-1 | 完全AI生成ゆえ生成物のセキュリティ担保が必須 | 脆弱性/シークレット/SAST/入力検証を標準ゲート化 | compliance視点 |
| RC-2 | OSSライセンス・依存の健全性 | 依存スキャン・ライセンスチェックを雛形に内蔵 | compliance視点 |
| RC-3 | 安全側の既定（暗号化・最小権限IAM） | AWS構成の標準装備として組み込む | aws-platform/compliance |
| RC-4 | データ分類・レジデンシは将来要件として保留 | 横展開フェーズで再評価 | compliance視点 |

## 前提（未確定で後続が確定すべき事項）

- 雛形の提供形態（CLI / リポジトリテンプレート / ワークフロー）→ scope-definition
- 品質ゲートの定量合格基準（カバレッジ閾値・許容脆弱性レベル）→ requirements-analysis / nfr-requirements
- AWSの具体サービス・デプロイモデル → infrastructure-design

<!-- Text fallback: 技術制約5件(完全AI生成/TSスタック/AWS/fail-closed品質ゲート/フルスタック)、組織制約3件(個人→チーム/採用KPI/市場スピード)、規制セキュリティ4件(生成物セキュリティ/OSS/安全側既定/データ保留)。未確定3件は後続ステージで確定。 -->
