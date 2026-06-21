# Unit ↔ Story / Requirement Map — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate, rev.2)
> Upstream: `unit-of-work.md`, `stories.md`(US-*), `requirements.md`(FR-*)
> トレースは**FR細目粒度**で検証（FR群粒度では孤児を見逃すため, 前回学習）。

## Unit → Story / FR

| Unit | Stories | FR（細目） | NFR |
|------|---------|----|----|
| U0 Shared Contracts | （基盤・横断） | （契約: FR-1.4/FR-2基盤型） | — |
| U1 CLI & Setup | US-D1, US-C1(AC2) | FR-6.1/6.2/6.3, FR-3.3 | — |
| U2 Intent Pipeline | US-A1, US-A2(AC3) | FR-1.1/1.2 | — |
| U3 Code Generation | US-A2(AC1/AC2) | FR-1.3/1.4 | NFR-1.2(型0), **NFR-4.1(再現性)** |
| U4 Gate Framework | US-B1, US-D2 | FR-2.1/2.2, FR-6.4 | NFR-5.1 |
| U5 Gate Pillars | US-B1 | FR-2.1 | NFR-1.1, NFR-2 |
| U6 AutoFix & Escalation | US-B2, US-B3 | FR-2.3/2.4 | — |
| U7 Deployer | US-C2 | FR-4.1/4.2/4.3/4.4 | NFR-1.3 |
| U8 Generated App Template | US-C1(AC1), US-C3 | **FR-3.1/3.2**, FR-5.1/5.2/5.3/5.4 | NFR-1.1, NFR-5.1, **NFR-6.1(ドキュメント/規約)** |

> **F3対応:** FR-3.1(一貫構成生成)/FR-3.2(品質設定の内蔵)は**U8**（テンプレート＋同梱QualityConfig AC-7）が満たす。U1はFR-3.3(競合検出, TC-2)のみ。
> **F4対応:** US-C1は**マルチユニット**: AC1(品質設定が内蔵)=U8、AC2(競合検出)=U1。
> **F8対応:** US-A2 AC3(欠落差し戻し)はU2の生成前チェックで発火（U3ではない）。

## Story → Unit（逆引き・孤児チェック）

| Story | Unit | カバー |
|-------|------|--------|
| US-A1 | U2 | ◯ |
| US-A2 | U3(AC1/2) + U2(AC3) | ◯ |
| US-B1 | U4, U5 | ◯ |
| US-B2 | U6 | ◯ |
| US-B3 | U6 | ◯ |
| US-C1 | U8(AC1) + U1(AC2) | ◯（マルチユニット） |
| US-C2 | U7 | ◯ |
| US-C3 | U8 | ◯ |
| US-D1 | U1 | ◯ |
| US-D2 | U4 | ◯ |

## FR細目 孤児チェック（F3再発防止・FR粒度で全数確認）

| FR | Unit | | FR | Unit |
|----|------|-|----|------|
| FR-1.1/1.2 | U2 | | FR-4.1〜4.4 | U7 |
| FR-1.3/1.4 | U3 | | FR-5.1〜5.4 | U8 |
| FR-2.1/2.2 | U4/U5 | | FR-6.1/6.2/6.3 | U1 |
| FR-2.3/2.4 | U6 | | FR-6.4 | U4 |
| FR-3.1/3.2 | **U8** | | FR-7 | （除外・Unit化せず） |
| FR-3.3 | U1 | | | |

- **孤児FRなし（FR細目で全数確認済み）:** FR-1〜6の全細目がUnitに対応。FR-3.1/3.2の取りこぼしを解消。
- **孤児Unitなし:** U0〜U8すべてStory/FR/契約にトレース。
- **FR-7（スコープ外）:** Unit化しない。U8のAuthはスタブのみ。

## NFR横断の配置（F7: NFR-4/6追加）
- NFR-1(品質): U3(型)・U5(テスト/カバレッジ)・U7(デプロイ)・U8(生成物が緑)。
- NFR-2(セキュリティ): U5c。
- NFR-3(速度): U7(差分デプロイ)・全体（performance-validation）。
- **NFR-4(再現性/保守性): U3**（同一意図→再現的生成）。
- NFR-5(a11y): U4(可視化)・U8(生成UI)。
- **NFR-6(運用性/横展開): U8**（同梱ドキュメント・規約）・U1(セットアップ容易性)。

## walking skeleton（Bolt 1）に含むStory（3成果物で統一）
US-D1→US-A1→US-A2→US-B1→US-C2＋US-C3(薄い1リソースCRUD) の薄い縦スライス。Unitでは {U0,U1,U2,U3,U4,U5,U7,U8}。**US-B2/B3(U6)はBolt 1に含まない**（自動修正はBolt 2）。
