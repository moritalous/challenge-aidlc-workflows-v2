# Refined Mockups — Questions

> Mode: Desk（Inception効率進行。rough-mockups/stories/requirementsから精緻化。デザイントーンは未指定→ミニマル既定）

## Q1. デザイントーン/ブランドは？
[Answer]: 未指定のためミニマル既定（開発者ツールらしい簡潔さ）。中立的カラーパレット、システムフォント。横展開時にテーマ差し替え可能な設計。

## Q2. 対応フォームファクタは？
[Answer]: CLIはターミナル。参照アプリWebはデスクトップファースのレスポンシブWeb（モバイルは段階対応）。

## Q3. アクセシビリティ目標水準は？
[Answer]: WCAG 2.1 AA を目標。色非依存・キーボード操作・スクリーンリーダー対応（rough-mockups a11y note / NFR-5.1準拠）。

## Q4. CLI初回セットアップ失敗パスの表示は？（rough-mockupsの宿題）
[Answer]: AWS認証情報未検出/無効時に、原因と設定手順（aws configure相当）を示し再試行を促す画面を追加（US-D1 AC2準拠）。
