# Code Generation Plan — Walking Skeleton

> Status: Draft (awaiting plan approval)
> Test Strategy: **Standard**（コンポーネント毎 5-8 単体テスト＋主要境界の結合テストスタブ）
> Units in skeleton: {U0,U1,U2,U3,U4,U5,U7,U8}（**U6=AutoFix/Escalation 除外**）
> 2層: (A)雛形ツール CLI / (B)生成アプリ テンプレート(Task CRUD)

## 生成先ディレクトリ（workspace root、monorepo）

```
/package.json            # npm workspaces ルート
/tsconfig.base.json      # 共通TS設定（strict）
/.eslintrc.cjs /.prettierrc /vitest.config.ts
/packages/
  contracts/             # U0契約: IntentModel / GateResult / Project / GenOutput
  scaffold-cli/          # (A) 雛形ツール本体（U1,U2,U3,U4,U5,U7）
/templates/
  task-app/              # (B) 生成アプリ テンプレート
    api/                 # Hono on Lambda（handlers/service/repository/validation）
    web/                 # React + Vite（components/pages）
    infra/               # AWS CDK（U8: AppStack）
```

## ステップ（層順・依存先行）

- [ ] **Step 1: プロジェクト構造** — ルート package.json(workspaces) / tsconfig.base(strict) / eslint / prettier / vitest 設定。 traces: NFR-1.2, tech-stack-decisions
- [ ] **Step 2: U0契約 (packages/contracts)** — `IntentModel`(operations に changeStatus 保持), `GateResult`(pillar/status 4状態), `Project`/`GenOutput`(traceability=filePaths) を型定義。 traces: domain-entities.md, US-A2/US-D2
- [ ] **Step 3: ゲート評価ロジック (scaffold-cli/gate/evaluate.ts)** — fail-closed `evaluate()`（length===4 && every PASS、PENDING/ERROR=非PASS、順序非依存、非PASS→HaltForHuman）。 traces: BR-T1/BR-T1', REL-T1
- [ ] **Step 4: Step3のテスト (evaluate.test.ts)** — 全PASS合格 / 1FAILで不合格 / PENDING非PASS / ERROR非PASS / 部分合格(3柱)不合格 / 順序非依存 の各ケース。 traces: US-D2 AC2/AC3, US-B2 AC3
- [ ] **Step 5: QualityGate (gate/quality-gate.ts)** — 4柱を `Promise.allSettled`＋タイムアウトで並列実行→正規化→`evaluate()`。タイムアウト/例外=ERROR。 traces: PERF-T2, BR-T1
- [ ] **Step 6: Step5のテスト (quality-gate.test.ts)** — モック柱で全PASS/混在/タイムアウト→ERROR/並列実行 を検証。 traces: PERF-T2, SEC-T1〜3
- [ ] **Step 7: IntentParser (intent/parser.ts, U2)** — 自然言語意図→`IntentModel`。欠落検出(entities空→差し戻し, BR-T4)。 traces: FR-1.1, US-A2
- [ ] **Step 8: Step7のテスト (parser.test.ts)** — 正常解析 / 欠落検出 / changeStatus を operations に保持。 traces: BR-T4
- [ ] **Step 9: CodeGenProvider + Generator (gen/, U3)** — `CodeGenProvider` IF（差替可, ADR-004）＋ `TemplateProvider` 実装（templates/task-app を素に Project 生成）＋ traceability。秘匿情報はenv経由。 traces: ADR-004, REL-T2, SEC-T5
- [ ] **Step 10: Step9のテスト (generator.test.ts)** — Provider差し替え / GenOutput.filePaths 生成 / IntentModel→files マッピング。 traces: FR-1.3/1.4
- [ ] **Step 11: ProjectStore (store/project-store.ts, U1)** — 生成物/進捗のファイル永続（保存/読込）。 traces: REL-T5, SCALE-T1
- [ ] **Step 12: Deployer (deploy/deployer.ts, U5)** — `Project.iacEntry` を介し `cdk deploy` 実行＋スモーク(/health 200/5秒)＋失敗時ロールバック手順提示（冪等, BR-T6）。子プロセス境界をtry/catch。 traces: REL-T3, PERF-A2
- [ ] **Step 13: CliOrchestrator + entry (orchestrator.ts, cli.ts, U7横断)** — 状態機械 Idle→Parsing→Reviewing→Generating→Gating→Deploying/HaltForHuman→Done。非PASSは HaltForHuman(理由提示・1停止)。 traces: business-logic-model.md, BR-T1'
- [ ] **Step 14: Step13のテスト (orchestrator.test.ts)** — happy path(全PASS→Deploying) / 非PASS→HaltForHuman(自動修正しない) / 欠落→Reviewing差し戻し。 traces: BR-T1'
- [ ] **Step 15: 生成アプリ API (templates/task-app/api, B)** — Hono `/tasks` CRUD + `/health`。zod検証(BR-A2)→TaskService→TaskRepository(DynamoDB, PK=id, スキャン無)。構造化エラー。 traces: FR-5, BR-A1〜A4, SEC-A1
- [ ] **Step 16: Step15のテスト (api tests)** — 作成(検証)/取得/更新(changeStatus=PUT)/削除 + 不正入力400 + happy+2エッジ。 traces: BR-A1/A2, 構成phaseルール
- [ ] **Step 17: 生成アプリ Web (templates/task-app/web, B)** — React: LoginPage/TaskListPage/TaskDetailPage/ConfirmDialog/StatusBanner/AlertBanner/EmptyState。data-testid付与・WCAG AA。 traces: frontend-components.md, NFR-5.1
- [ ] **Step 18: Step17のテスト (web component tests)** — 一覧表示/空状態/保存成功バナー/削除確認/保存失敗時入力保持。 traces: US-C3
- [ ] **Step 19: CDK Infra (templates/task-app/infra, U8)** — `AppStack`: S3(OAC)+CloudFront+HTTP API+Lambda+DynamoDB(PITR)+最小IAM。`iacEntry` を公開。 traces: deployment-architecture.md, SEC-A4
- [ ] **Step 20: Infra テスト (infra cdk assertions test)** — スタックsynth/主要リソース存在/IAMにワイルドカードなし。 traces: SEC-A4
- [ ] **Step 21: 設定・環境 (.env.example, build config)** — env テンプレート（TABLE_NAME等、シークレット非格納）。 traces: SEC-A3/T5
- [ ] **Step 22: ドキュメント (README)** — ルート/各パッケージの実行手順・アーキ概要。 traces: NFR-6.1

## ストーリー→ステップ トレーサビリティ（要約）
| ストーリー/FR | 実装ステップ |
|---------------|--------------|
| US-A2(意図解析) | Step 7,8 |
| US-D2/US-B2(fail-closed可視化) | Step 3,4,5,6 |
| US-B3/HaltForHuman | Step 13,14 |
| US-C3(Task CRUD UI) | Step 17,18 |
| FR-4(冪等デプロイ/ヘルス) | Step 12,19 |

## テスト方針（Standard）
- 各コアコンポーネントに 5-8 単体テスト、API/Web/Infra境界に結合テスト。
- fail-close ロジック(Step3/4)を最重要として網羅。`assert true` 等の無意味テスト禁止（構成phaseルール）。
- カバレッジ目標 ≥80%（team practice）。

## スコープ外（明示）
- U6: AutoFixLoop / EscalationHandler（自動修正・3分岐エスカレーション）→ 後続Bolt。
- 本格認証(Cognito)・複数リソース・状態遷移規則の専用UI → 後続Bolt。
