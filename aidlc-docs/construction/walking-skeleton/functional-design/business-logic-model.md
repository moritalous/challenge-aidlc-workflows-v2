# Business Logic Model — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `component-dependency.md`, `business-rules.md`, `decisions.md`

## 中核フロー: 意図→生成→4柱ゲート→デプロイ（状態機械）

```
[Idle] --intent--> [Parsing] --ok--> [Reviewing] --approve--> [Generating]
   ^                   |                    |                       |
   |             missing-info          edit(再解析)               build/型OK
   |                   v                    |                       v
   |              [Reviewing]<--------------+                  [Gating]
   |                                                              |
   |                              all PASS <---------------+      | any FAIL
   |                                  |                    |      v
   |                                  v               [AutoFix(n<3)]
   |                              [Deploying] --ok--> [Done]   |
   |                                  | fail                  | 3回失敗
   |                                  v                       v
   +------------------------- [Escalation(3択)] <------------+
```
<!-- Text fallback: Idle→Parsing→(欠落ならReviewing差し戻し)→Reviewing→(editで再解析)→Generating→Gating→(全PASSでDeploying→Done / FAILでAutoFix最大3→3失敗でEscalation)。Deploying失敗もEscalation。 -->

## ゲート評価ロジック（BR-T1）
```
function evaluate(results: GateResult[]): { passed, next } {
  const passed = results.length === 4 && results.every(r => r.status === "PASS");
  return { passed, next: passed ? "Deploying" : "AutoFix" };
}
```
> PENDING/ERROR は every(PASS) を満たさず非合格（典拠=US-D2 AC2/AC3）。部分合格=不合格（典拠=US-B2 AC3）。

## エスカレーション後の3分岐（F1 / BR-T3 / US-B3）
```
[Escalation] --(1)rerun-intent----> カウンタreset → [Parsing]（意図から再実行）
             --(2)manual-resubmit-> カウンタreset → [Gating]（手動修正を再評価）
             --(3)abort-----------> ProjectStore.save → [Stopped]（後で再開可, US-B3 AC2）
```
<!-- Text fallback: エスカレーションの3択は (1)意図修正再実行=リセットしてParsingへ (2)手動修正再投入=リセットしてGatingへ (3)中断=保存してStopped(再開可)。 -->

## 自動修正ループ（BR-T2/BR-T3）
```
for (attempt of 1..3) {
  applyFix();              // CodeGenProvider経由で修正
  results = runAllGates(); // 全4柱再評価
  if (allPass(results)) return Converged;
}
return Escalate;           // 3択へ
```

## 生成アプリ Task CRUD ロジック（薄い）
- API(Hono): GET/POST/PUT/DELETE /tasks(/:id)。各ハンドラ = スキーマ検証 → Service → Repository(DynamoDB)。
- Frontend(React): 一覧→詳細/作成→保存/削除(確認)。状態は list/detail/create/confirm/empty。

## トレーサビリティ（FR→ロジック）
| FR | ロジック |
|----|---------|
| FR-1.1/1.2 | Parsing/Reviewing状態 |
| FR-1.3/1.4 | Generating + traceability生成 |
| FR-2.1/2.2 | evaluate() AND合成 |
| FR-2.3/2.4 | AutoFixループ/Escalation |
| FR-4 | Deploying状態 + 冪等デプロイ |
| FR-5 | Task CRUDロジック |
