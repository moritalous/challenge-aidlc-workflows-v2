# Scope Definition — Questions

> Upstream: intent-statement.md, feasibility-assessment.md, constraint-register.md
> 本ステージは提供形態・MVP境界という実質判断を含むため、利用者に確認する。

## Q1. 「雛形」の提供形態はどれですか？（最重要の分岐）

- A. リポジトリテンプレート（GitHub Template / starter repo を clone して使う）
- B. CLIジェネレータ（`create-xxx` のように対話で生成する）
- C. AI-DLC的ワークフロー／エージェント（自然言語の意図からAIが生成・検証する仕組み）
- D. 上記の組合せ（例: スターターrepo + 品質ゲート + AI生成ワークフロー）
- X. Other (please specify)

[Answer]: D — スターターrepo + 品質ゲート + AI生成ワークフローの組合せ

## Q2. 最初に実証する最小スライス（walking skeleton）の範囲は？

- A. ごく薄い縦切り（フロント1画面 + API1本 + DB1テーブル + CI品質ゲート + AWSデプロイが通る）
- B. 代表的CRUDアプリ一式（認証 + CRUD + 一覧/詳細 + テスト + デプロイ）
- C. AI生成フロー込み（意図→生成→品質ゲート→デプロイの一連が回る最小デモ）
- X. Other (please specify)

[Answer]: C — 意図→生成→品質ゲート→デプロイの一連が回る最小デモ

## Q3. 品質ゲート（4本柱: テスト/静的解析・型/セキュリティ/デプロイ可能性）の初期スコープは？

- A. 4本柱すべてを最初から必須化（fail-closed）
- B. まずテスト＋静的解析・型を必須、セキュリティ＋デプロイは段階的に追加
- C. テスト＋デプロイ可能性を優先、静的解析・セキュリティは次段階
- X. Other (please specify)

[Answer]: A — 4本柱すべてを最初から必須化（fail-closed）

## Q4. 優先順位付けの方針（シーケンス）は？

- A. リスクファースト（中核テーゼ＝速度×品質の両立を最初に実証）
- B. 価値ファースト（利用者がすぐ嬉しい機能から）
- C. 依存ファースト（基盤・足回りから固める）
- X. Other (please specify)

[Answer]: A — リスクファースト（速度×品質の両立を最初に実証）

## Q5. 明確な期限に紐づく機能はありますか？
[Answer]: なし — 明確な期限はない。市場スピード重視のため早期skeletonを優先
