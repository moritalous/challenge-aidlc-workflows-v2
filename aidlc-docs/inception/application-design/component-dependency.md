# Component Dependency — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Upstream: `components.md`, `component-methods.md`
> 依存DAG（トポロジのみ。ビルド順の経済的選択は delivery-planning）。

## ツール側 制御フロー依存

```
CLIShell/SetupWizard (TC-1)
      |
      v
TemplateScaffolder (TC-2)   [競合検出]
      |
      v
IntentParser (TC-3) --(IntentModel)--> IntentReviewPresenter (TC-4)
                                            | (承認)
                                            v
                                   CodeGenerator (TC-5) --uses--> CodeGenProvider (TC-11)
                                            |
                                            v
                                  QualityGateRunner (TC-6)
                                  /    |     |      \
                              TC-6a  TC-6b  TC-6c   TC-6d
                                            |
                                  [全PASS?] --no--> AutoFixLoop (TC-7) --3回失敗--> EscalationHandler (TC-8)
                                            | yes                                       |
                                            v                                    (abort) ProjectStore (TC-12)
                                       Deployer (TC-9)
                                            |
                                            v
                                    GateReporter (TC-10)  [全工程の状態可視化]
```
<!-- Text fallback: Setup→Scaffold→IntentParse→Review→Generate(uses Provider)→QualityGate(4柱)→[全PASSならDeploy / 不合格はAutoFix最大3→失敗でEscalation(abort時Store)]。GateReporterが全状態を可視化。 -->

## 依存表（主要エッジ）

| From | To | 種別 |
|------|----|----|
| TC-1 | TC-2 | 順序 |
| TC-3 | TC-4 | データ(IntentModel) |
| TC-4 | TC-5 | 承認イベント |
| TC-5 | TC-11 | 利用(抽象境界) |
| TC-5 | TC-6 | 順序 |
| TC-6 | TC-6a/b/c/d | 集約(AND) |
| TC-6 | TC-7 | 不合格時 |
| TC-7 | TC-8 | 3試行失敗時 |
| TC-6 | TC-9 | 全PASS時 |
| TC-8 | TC-12 | abort時保存 |
| TC-10 | (all) | 観測(横断) |

## 生成アプリ側 依存

```
Web Frontend (AC-1) --HTTP--> API Handlers (AC-2) --> Domain/Service (AC-3) --> Data Access (AC-4) --> DynamoDB
Auth Stub (AC-5) は AC-1/AC-2 が参照（将来Cognitoに差し替え）
IaC (AC-6) は AC-1〜AC-5 をプロビジョニング対象とする
Quality Config (AC-7) は全体に適用（CI）
```

## 循環依存チェック
- ツール側・生成アプリ側ともに**循環なし**（単方向DAG）。
- TC-10(GateReporter)は観測のみで他に依存されない（横断）。
- TC-11(Provider)は末端の抽象境界で被依存のみ。

## walking skeleton の最小経路
`TC-1 → TC-3 → TC-4 → TC-5 → TC-6(4柱) → TC-9` が「意図→生成→ゲート→デプロイ」の端〜端（中核テーゼ実証経路）。AutoFix/Escalationは付随。
