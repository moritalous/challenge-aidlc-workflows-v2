# Team Allocation — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Upstream: `bolt-plan.md`, `team-assessment.md`, `mob-composition.md`
> チームモデル: 人間オーケストレーター1名＋AIエージェントmob（team-formation）。

## Bolt別の主担当ロール

| Bolt | 主担当AIロール | 人間の関与 |
|------|----------------|-----------|
| Bolt 1 (skeleton) | developer(生成), quality(テスト柱), devsecops(セキュリティ柱), aws-platform(デプロイ/IaC), architect(契約U0) | **必須ゲート承認**＋ladder prompt決定 |
| Bolt 2 (自動修正) | developer | autonomyに従う（gated時は承認） |
| Bolt 3 (深化, 並列) | quality+devsecops(ゲート深化) ‖ developer+design(アプリ完全化) | autonomyに従う |
| Bolt 4 (仕上げ) | aws-platform, developer, operations | autonomyに従う |

## RACIサマリ（Bolt 1 walking skeleton）

| アクティビティ | R | A | C |
|----------------|---|---|---|
| 共有契約U0設計 | architect | 人間 | developer |
| CLI/Setup U1 | developer | 人間 | — |
| Intent Pipeline U2 | developer | 人間 | architect |
| Code Gen U3 | developer | 人間 | architect |
| Gate Framework U4 | developer/quality | 人間 | — |
| Gate Pillars U5 | quality/devsecops | 人間 | — |
| Deployer U7 | aws-platform | 人間 | pipeline-deploy |
| Template U8 | developer/design | 人間 | — |

> Accountableは常に人間（承認ゲート意思決定者）。AIロールはオーケストレーター経由でのみ起動、エージェント間直接委譲は禁止。

## キャパシティ/autonomy
- Bolt 1は単独・ゲート必須。承認後のladder promptで Bolt 2以降の autonomy（自律 or 各Boltゲート）を決定し `Construction Autonomy Mode` に記録。
- 並列バッチ（Bolt 3）は autonomy=autonomous かつ依存充足時に swarm 実行も選択可。
