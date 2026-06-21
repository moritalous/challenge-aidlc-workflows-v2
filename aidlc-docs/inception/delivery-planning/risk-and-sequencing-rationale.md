# Risk & Sequencing Rationale — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Upstream: `bolt-plan.md`, `raid-log.md`, `scope-document.md`(Q4=リスクファースト)

## シーケンス方針: リスクファースト

scope Q4（リスクファースト）に従い、**最大の不確実性を最初のBoltで潰す**。最不確実領域は RAID R-1（AI生成品質のばらつきをゲートで吸収できるか）と中核テーゼ（速度×品質の両立）。

## Bolt順の根拠

| Bolt | 狙うリスク | 根拠 |
|------|-----------|------|
| Bolt 1 (skeleton) | R-1(生成品質), 中核テーゼ未実証 | 「意図→生成→4柱→デプロイ」を薄く1回転させ、最大の不確実性を最初に検証。失敗ならここで方針転換できる（reversibility） |
| Bolt 2 (自動修正) | 不合格時の回復が成立するか | skeletonで「合格経路」を確認後、「不合格→回復」経路を固める |
| Bolt 3 (深化) | 定量基準・本番品質の達成 | 経路が通った後に4柱の閾値強制とアプリ完全化（価値の積み増し） |
| Bolt 4 (仕上げ) | 運用堅牢性・横展開 | 最後に堅牢化とドキュメント（採用KPIの土台） |

## なぜ依存ファースト/価値ファーストにしないか
- **依存ファースト却下:** 足回りを完璧に固めてから縦に貫くと、中核テーゼの検証が後ろ倒しになりリスクが残存。
- **価値ファースト却下:** 利用者価値の高い機能から作ると、最不確実な「品質ゲート×AI生成」の成立が遅れる。

## リスク緩和の組み込み（RAID対応）
- **R-2(スコープクリープ):** Bolt 1を「薄い1リソース」に厳格限定。多形態はWon't（FR-7）。
- **R-3(ツール急変):** U0契約＋CodeGenProvider抽象でモデル差し替え可能（application-design ADR-004）。
- **R-4(生成物セキュリティ):** Bolt 1から U5c(セキュリティ柱)を必須に含める（fail-closed）。
- **R-5(速度低下):** ゲートは並列/差分デプロイで高速化（ADR-005, services時間予算）。

## ゲート/autonomy方針
- Bolt 1は単独・ゲート必須（org/team: greenfield feature skeleton on）。
- 失敗は autonomy 無関係に halt-and-ask（retry/skip/abort）。
- Bolt 2以降は ladder prompt の選択（自律 or 各Boltゲート）に従う。
