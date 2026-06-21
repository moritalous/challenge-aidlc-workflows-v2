# Bolt Plan — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Lead: aidlc-delivery-agent / Support: aidlc-architect-agent
> Upstream: `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, `team-practices.md`
> マージ方針: 各Boltはsquashでmainへ1コミット（team-practices/org）。Bolt 1=walking skeleton（単独・ゲート付き）。

## Bolt 1 — Walking Skeleton（中核テーゼ実証）★単独・ゲート必須

- **含むUnit:** U0(契約), U1, U2, U3, U4, U5, U7, U8 の**薄い1リソース縦スライス**（U6=自動修正は含まない）。
- **ゴール:** 「意図→生成→4本柱fail-closedゲート→AWSデプロイ」が端から端まで**1回転**する（速度×品質の両立を最初に実証）。
- **臨界経路:** U0→U1→U2→U3→U4→U5→U7。
- **DoD:** 薄い1リソースCRUDアプリが生成され、4柱（テスト/静的解析・型/セキュリティ/デプロイ）を通過し、AWS（サーバレス）にデプロイされ公開URLが出る。U8テンプレートの同梱CIが緑。
- **ゲート:** Bolt-levelゲート（必須・autonomy無関係）。承認後に **ladder prompt**（残りBoltを自律 or 各Boltゲート）。

## Bolt 2 — 自動修正ループ & 意図体験の肉付け

- **含むUnit:** U6(AutoFix & Escalation 全体), U2/U3の肉付け（編集ループ・欠落差し戻しの完全化）。
- **ゴール:** ゲート不合格時のAI自動修正(最大3試行)→失敗エスカレーション(3択)が機能する（US-B2/B3）。
- **依存:** Bolt 1（U4再評価・U2/U3再生成・U1保存が前提）。
- **DoD:** 不合格→自動修正→収束 or エスカレーションのフローが回り、テストが緑。

## Bolt 3 — 品質ゲート深化 & 参照アプリ完全化（並列バッチ候補）

- **含むUnit:** U5の深化（U5a全テスト種別/E2E, U5cセキュリティ全種, カバレッジ閾値強制）, U8の状態網羅（空状態/削除確認/保存成否/ログイン失敗/a11y axe）。
- **ゴール:** 4本柱の定量基準（≥80%, High0等）を完全強制。参照アプリがWCAG AAと全状態を満たす。
- **並列性:** U5深化(quality/devsecops) と U8深化(developer/design) は独立 → **並列バッチ可**。
- **依存:** Bolt 1。

## Bolt 4 — 仕上げ（運用性・堅牢化・ドキュメント）

- **含むUnit:** U7堅牢化（ロールバック/差分デプロイ/health詳細）, U4 GateReporter全状態, U1セットアップ周辺エッジ, NFR-6ドキュメント/規約（横展開の土台）。
- **ゴール:** 本番運用に耐える堅牢性とオンボーディング容易性。
- **依存:** Bolt 1〜3。

## Bolt シーケンス図

```
[Bolt 1: Walking Skeleton] --(gate + ladder prompt)-->
   |
   +--> [Bolt 2: AutoFix/Escalation]
   |
   +--> [Bolt 3: Gate深化 || App完全化]  (並列バッチ候補)
                   |
                   v
            [Bolt 4: 仕上げ/運用性]
```
<!-- Text fallback: Bolt1(skeleton,単独ゲート)→ladder→Bolt2(自動修正)→Bolt3(ゲート深化||アプリ完全化,並列)→Bolt4(仕上げ)。各Boltはsquashマージ。 -->

## Unit → Bolt 割当（全数）

| Unit | Bolt |
|------|------|
| U0 | Bolt 1 |
| U1 | Bolt 1（薄）→ Bolt 4（エッジ） |
| U2 | Bolt 1（薄）→ Bolt 2（完全化） |
| U3 | Bolt 1（薄）→ Bolt 2（完全化） |
| U4 | Bolt 1 → Bolt 4（Reporter全状態） |
| U5 | Bolt 1（最小4柱）→ Bolt 3（深化） |
| U6 | Bolt 2 |
| U7 | Bolt 1（基本）→ Bolt 4（堅牢化） |
| U8 | Bolt 1（薄CRUD）→ Bolt 3（完全化） |

> 全Unitが少なくとも1つのBoltに割当（孤児Unitなし）。リスクファースト順（最不確実なU2/U3/U5/U7を最初のBolt 1で薄く貫通）。
