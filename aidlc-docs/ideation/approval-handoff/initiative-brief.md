# Initiative Brief — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate — Ideation→Inception handoff)
> Lead: aidlc-delivery-agent / Support: aidlc-product-agent
> Synthesizes: intent-statement, market(competitive-analysis), feasibility-assessment, constraint-register, scope-document, intent-backlog, team-assessment, wireframes

## 1. イニシアチブ概要

**自然言語の意図から、完全AIでコードを生成し、4本柱の品質ゲート（テスト・静的解析/型・セキュリティ・デプロイ可能性）を fail-closed で必ず通過させて、AWS上に本番品質のフルスタックWebアプリを高速に立ち上げる「雛形」** を構築する。提供形態は **組合せ**（スターターrepo＋品質ガードレール＋AI生成ワークフロー）。

**核心テーゼ:** バイブ開発の「速度」と本番運用に耐える「品質」を、型と自動ゲートで同時に成立させる。

## 2. なぜ（課題・市場・トリガー）

- **課題（intent）:** AI生成は速いが品質がばらつく。個人エンジニアがアイデアを素早く本番品質のアプリにできない。
- **市場（competitive-analysis）:** 競合は3層（AIビルダー=速度／スターター=再現性／品質ツール=単体）。3層を統合し「AI生成前提×自動品質ゲート」を型化した製品は手薄＝参入機会。
- **トリガー（intent）:** 市場・競合のスピード向上。「速く作る」はコモディティ化、次の競争軸は「速く、かつ本番品質で」。

## 3. 誰のために

- 一次=個人エンジニア（少人数）、将来チーム/組織へ横展開（採用・再利用数が主要KPI）。

## 4. 何を作るか（スコープ）

- **In:** TSフルスタックstarter、AI生成ワークフロー、4本柱品質ゲート（全fail-closed必須）、AWSサーバレスデプロイ、最小ドキュメント。
- **Out:** 多アプリ形態の一般化、組織配布基盤、非エンジニア向けUI、マルチクラウド、重い規制対応。
- **walking skeleton:** 「意図→生成→4本柱ゲート→AWSデプロイ」が端から端まで1回転する薄い縦切り。リスクファースト。

## 5. 実現性と制約

- **実現性（feasibility）:** 総合HIGH / **Go**。新規研究要素なし、成熟技術の統合で実現可能。
- **主要制約（constraint-register）:** 完全AI生成前提(TC-1)、TSスタック(TC-2)、AWS(TC-3)、fail-closedゲート(TC-4)、生成物セキュリティ担保(RC-1)。
- **主要リスク（RAID）:** AI生成品質ばらつき、スコープクリープ、ツール領域の急変、生成物セキュリティ。いずれも緩和策あり。

## 6. 誰が作るか

- 人間オーケストレーター1名＋AIエージェントmob（AI-DLC 11ロール）。人間は意図定義・承認・最終判断、AIが設計/生成/検証/デプロイを分担。

## 7. 成功指標（KPI）

- 主要: 採用・再利用数。先行: 開発リードタイム短縮、品質ゲート通過率、手直し率低減、本番到達率。（定量目標は requirements-analysis で確定）

## 8. Inceptionへの引き継ぎ事項（要確定リスト）

| # | 未確定事項 | 確定ステージ |
|---|-----------|--------------|
| 1 | 雛形の提供形態の実装方式（repo構造＋CLI＋ワークフローの具体） | application-design |
| 2 | 品質ゲート4本柱の定量合格基準（カバレッジ閾値・許容脆弱性レベル等） | requirements-analysis / nfr-requirements |
| 3 | AWS具体サービス・デプロイモデル | infrastructure-design |
| 4 | 認証(B-8)の本格化、CLI初回セットアップ失敗パス | user-stories / refined-mockups |

## 9. 推奨

**Inceptionへ進むことを推奨。** Ideation成果は揃い、矛盾は解消済み。最初のBolt（walking skeleton）で中核テーゼを最優先実証する。

<!-- Text fallback: 本ブリーフはIdeation全成果を統合。提供形態=組合せ、4本柱fail-closedゲート、リスクファーストのwalking skeleton。実現性HIGH/Go。人間1+AIロール群。Inceptionへ進み未確定4項目を後続で確定する。 -->
