# Requirements Analysis — Questions

> Mode: Desk + 提案値（Inception効率進行。品質ゲート定量閾値は提案、承認ゲートで調整可）
> Upstream: intent-statement, scope-document, team-practices

## Q1. 品質ゲート4本柱の定量合格基準は？（提案値）
[Answer]: 提案 — ①テスト: ラインカバレッジ≥80%(team-practices準拠)、全テスト緑 ②静的解析/型: Lintエラー0・型エラー0・フォーマット準拠 ③セキュリティ: High/Critical脆弱性0・検出シークレット0・SAST High指摘0 ④デプロイ: CI通過後AWSへ実デプロイ成功＋ヘルスチェック通過。承認ゲートで調整可。

## Q2. AI自動修正の上限とエスカレーション条件は？
[Answer]: 提案 — ゲート不合格時、AIが最大3回まで自動修正・再チェック。3回失敗で人へエスカレーション（意図修正再実行/手動修正再投入/中断の3択）。

## Q3. 雛形が生成するアプリの既定スタックは？
[Answer]: モダンTypeScriptフルスタック（フロント+API+DB）。具体フレームワークは application-design で確定。デプロイ先はAWSサーバレス志向（infrastructure-designで確定）。

## Q4. 非機能の優先順位は？
[Answer]: 1.品質担保(信頼性) 2.セキュリティ 3.開発リードタイム(速度) 4.保守性/再現性。intent KPI(採用数)と整合。

## Q5. 認証スコープは？
[Answer]: walking skeletonはシードユーザー前提のスタブ。本格認証(Cognito等)はB-8(Should-have)。
