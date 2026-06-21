<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is maintained by the orchestrator during stage execution. Add observations at the gate ritual, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-06-21T00:00:00Z — セキュリティ柱のdev依存脆弱性は本番非該当として扱う; カバレッジ/監査はランタイム成果物を基準に判定し、ビルド専用ツールチェーン(esbuild等)の脆弱性は `npm audit --omit=dev` を必須ゲートにして分離、全体auditはinformationalとして監視する。

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-06-21T00:00:00Z — マルチconfig monorepoの集約カバレッジは誤解を招く; カバレッジは実行コードに範囲を絞り(型定義barrel・エントリ配線・別環境でテストする層を除外)、別runの層(web等)は個別に閾値判定する。素の集約値で品質を判断しない。

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
