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

## Deviations
- 2026-06-21T13:34:19Z — 初版でカバレッジ表が孤児FR(FR-6.3/FR-4.4)を見落とし「孤児なし」と誤主張→product-leadレビュー(NOT-READY,7指摘)で発覚、AC追加と表訂正で再レビューREADY化。
## Interpretations
- 2026-06-21T13:34:19Z — FR細目(FR-x.y)単位でStory ACにトレースする方式を採用。FR群単位の粗いトレースは孤児を見逃すため。
