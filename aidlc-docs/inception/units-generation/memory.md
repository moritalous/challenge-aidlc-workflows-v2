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
- 2026-06-21T13:57:19Z — 初版でU5→U7→U8→U5の循環依存とFR-3.1/3.2孤児を内包→architecture-reviewer(NOT-READY,8指摘)。U0契約シーム導入(U7をProject契約に依存させU7→U8削除)で循環解消、FR細目粒度トレースで孤児解消し再レビューREADY化。
## Open questions
- 2026-06-21T13:57:19Z — U5の依存はU5d(デプロイ柱)のみU7に乗る部分依存。delivery-planningでBolt分割時にU5a/b/cとU5dを分けて配置できるよう意識（reviewer申し送り）。
