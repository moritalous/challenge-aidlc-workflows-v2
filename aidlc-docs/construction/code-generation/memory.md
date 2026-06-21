<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is maintained by the orchestrator during stage execution. Add observations at the gate ritual, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-06-21T00:00:00Z — モックした外部I/O(DynamoDB等)のユニットテストは緑でも、コードとIaCのIAM権限の不整合を検出できない; 生成コードのデータアクセス手段(Scan/Query等)は必ず付与IAMアクションと一致させ、不整合は権限を緩めず設計整合な手段(例: list用GSI+Query)で解消する。アーキレビューでこの種の「テストが捕まえない」欠陥を必ず点検する。

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
