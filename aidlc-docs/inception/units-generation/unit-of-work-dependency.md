# Unit Dependency DAG — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate, rev.2)
> Upstream: `unit-of-work.md`, `component-dependency.md`
> トポロジのみ（経済的ビルド順は delivery-planning）。

## 契約シームによる循環の遮断（F1/F2対策）

旧版は `U5→U7→U8→U5` の循環を抱えていた（Deployer U7 がテンプレート U8 に依存し、U8 が U5 に検証される、と読めたため）。本版で **U0: Shared Contracts** を導入し、U7 と U8 を**`Project`/`BuildArtifact` 契約**にのみ依存させて循環を物理的に断つ。

- **U7(Deployer)** は U8 ではなく **`Project`契約**に依存。生成済みProjectは呼び出し時にデータとして渡される。
- **U8(テンプレート, IaC同梱)** は `Project`契約に**適合**するだけで、U5(ゲート)に**ビルド依存しない**（U8は自身同梱のCI設定で自己検証）。
- **AC-6(IaC)は U8 が所有**（U7はIaCを所有しない）。U7は渡されたProjectの`cdk deploy`を実行するのみ。

## 依存グラフ（単方向）

```
U0 (Shared Contracts: IntentModel / GateResult / Project)
  |  (全Unitが契約として参照)
  v
U1 (CLI & Setup)
  |
  +--> U2 (Intent Pipeline) --> U3 (Code Generation) --(produces Project)--+
  |          ^(編集/欠落差し戻しはU2内で完結, F8)                            |
  +--> U4 (Gate Framework) <--------------------------------------------------+
              |
              v
         U5 (Gate Pillars) --(U5d calls)--> U7 (Deployer)  [U7はProject契約に依存]
              |
              v
         U6 (AutoFix & Escalation)  [U4再評価 / U2-U3再生成 / U1保存]

U8 (Generated App Template, IaC同梱) --(素材として使われる)--> U3
   ※U8はProject契約に適合。U7/U5には依存されない（被参照は素材提供のみ）
```
<!-- Text fallback: U0契約を全Unitが参照。U1→U2→U3(Project生成)→U4→U5→U6。U5dはU7(Deployer)を呼ぶがU7はProject契約のみ依存。U8テンプレートはU3が素材に使う一方向。IaCはU8所有。循環なし。 -->

## 依存表（depends-on）

| Unit | 依存先 | 理由 |
|------|--------|------|
| U0 | — | 共有契約（最初に確定） |
| U1 | U0 | 契約使用 |
| U2 | U0, U1 | CLIから起動・契約使用 |
| U3 | U0, U2, U8 | IntentModel使用＋テンプレU8を素材に生成 |
| U4 | U0, U1 | 契約・CLIから起動（柱はダミーで先行検証可） |
| U5 | U0, U4, U7(U5dのみ) | Runner契約／デプロイ柱はDeployer呼出 |
| U6 | U0, U4, U2, U3, U1 | 再評価・再生成・保存 |
| U7 | U0 | `Project`契約のみ（U8非依存, 循環遮断） |
| U8 | U0 | `Project`契約に適合（自己完結） |

## 循環依存チェック（再検証）

- トポロジカル順序が成立: **U0 → U1 → U8 → U2 → U4 → U3 → U7 → U5 → U6**（U8はU3より前に用意、U7はU5より前）。
- かつて疑われた `U5→U7→U8→U5`: U7はU8に依存しない（U0契約のみ）→ エッジ `U7→U8` を**削除**。U8→U5 も存在しない（U8は自己検証）。→ **循環解消**。
- U3→U8 は「素材としての一方向利用」、U5d→U7 は「呼び出し」。いずれも単方向。
- 結論: **循環なし（契約シームで保証）**。

## walking skeleton スライス（3成果物で統一）
Bolt 1 = {U0,U1,U2,U3,U4,U5,U7,U8} の薄い1リソース縦スライス。**U6は含まない**（自動修正はBolt 2）。臨界経路: U0→U1→U2→U3→U4→U5→U7。
