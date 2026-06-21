<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is maintained by the orchestrator during stage execution. Add observations at the gate ritual, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->

## Interpretations
- 2026-06-21T12:23:33Z — 「雛形」は開発者向けツール(提供形態D)のため、UIを2面で解釈: ①AI生成ワークフローのCLI/ターミナル体験 ②生成される参照アプリのWeb UI(薄い縦切りCRUD)。エンドユーザー向け画面美よりワークフロー体験のラフ化を優先した。

## Deviations
- 2026-06-21T12:28:56Z — Step5必須のper-screen a11y noteを初版で欠落→product-lead-agentのレビュー指摘(NOT-READY)を受け全画面に追加し再レビューでREADY化。ステージ定義の通読不足が原因。

## Open questions
- 2026-06-21T12:28:56Z — CLI初回セットアップの失敗パス(AWS認証未検出時の再試行表示)が未描画。refined-mockupsで補完(reviewer非ブロッカー指摘)。
