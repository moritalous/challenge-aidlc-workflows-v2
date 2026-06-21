# Logical Components — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `application-design/components.md`(TC/AC), `unit-of-work.md`(U0〜U8), `nfr-design/*`
> NFR設計を満たす論理コンポーネント配置。skeletonに含む単位 = {U0,U1,U2,U3,U4,U5,U7,U8}（U6除外）。

## (A) 雛形ツールの論理コンポーネント

| コンポーネント | 単位 | 責務 | 主要NFR |
|----------------|------|------|---------|
| `IntentParser` | U2 | 自然言語意図 → `IntentModel`（U0契約） | PERF-T3, REL-T2 |
| `CodeGenProvider`（IF） | U3 | AIモデル隔離・コード生成。`GenOutput`(files+traceability)返却 | REL-T2, 差替性(ADR-004) |
| `Generator` | U3 | テンプレート＋Provider出力 → `Project`(U0契約) | REL-T2 |
| `QualityGate` | U4 | 4柱を並列評価し `GateResult[]` を合成（fail-closed） | PERF-T2, REL-T1, SEC-T1〜3 |
| `Deployer` | U5 | `Project` を AWS へ冪等デプロイ＋ヘルスチェック | REL-T3, PERF-A2 |
| `ProjectStore` | U1 | 生成物・進捗の永続（abort時保存の土台） | REL-T5, SCALE-T1 |
| `CliOrchestrator` | 横断（U1 CLIShell が駆動。U4/U5/U7を協調） | 状態機械（Idle→…→Done/HaltForHuman）駆動。U7=Deployer単体とは別 | REL-T1, REL-T5 |
| `InfraTemplates(CDK)` | U8 | CDKエントリ・スタック定義（`Project.iacEntry`所有） | REL-T3, SEC-A4 |

> **U6（AutoFixLoop / EscalationHandler）は skeleton に含まない**。`QualityGate` 非PASS時は `CliOrchestrator` が `HaltForHuman` で停止（BR-T1'）。U6導入時に `QualityGate`→`AutoFixLoop`→`EscalationHandler` を接続。

### 依存方向（循環なし）
```
CliOrchestrator → IntentParser → (IntentModel U0契約)
CliOrchestrator → Generator → CodeGenProvider
CliOrchestrator → QualityGate → (GateResult U0契約)
CliOrchestrator → Deployer → (Project U0契約) ← InfraTemplates(iacEntry)
全コンポーネントは U0契約(IntentModel/GateResult/Project)に依存し、相互の実体には依存しない（循環遮断）。
```
<!-- Text fallback: Orchestratorが各コンポーネントを呼び、各コンポーネントはU0契約のみに依存。Deployerが消費するiacEntryはInfraTemplates(U8)が所有。U7→U8はProject契約経由で循環なし。 -->

## (B) 生成アプリの論理コンポーネント

| コンポーネント | 層 | 責務 |
|----------------|----|----|
| `Frontend(React)` | UI | LoginPage/TaskListPage/TaskDetailPage 他（frontend-components.md） |
| `Api(Hono)` | API | `/tasks` CRUD＋`/health`。zod検証→Service |
| `TaskService` | ドメイン | Task のバリデーション・ユースケース |
| `TaskRepository` | 永続 | DynamoDB アクセス（PK=id, スキャン禁止） |

```
Frontend → API Gateway → Api(Hono) → TaskService → TaskRepository → DynamoDB
```

## トレーサビリティ（NFR→コンポーネント）
| NFR設計 | コンポーネント |
|---------|----------------|
| performance-design 並列ゲート | QualityGate |
| security-design 4スキャナ合成 | QualityGate(security柱) |
| reliability-design fail-closed/HaltForHuman | QualityGate, CliOrchestrator |
| scalability-design 配信/DB | InfraTemplates, TaskRepository |
