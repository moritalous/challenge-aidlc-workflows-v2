# Component Methods / Contracts — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Upstream: `components.md`, `decisions.md`
> 主要コンポーネントのインターフェース（型レベル契約）。実装はConstructionで。

## 共通スキーマ

```ts
// 意図の安定スキーマ（ツール内の契約, ADR-004）
type IntentModel = {
  entities: { name: string; fields: { name: string; type: string }[] }[];
  // detail = 詳細編集(update含む)。confirm = 破壊的操作の確認ダイアログ(FR-5.2)。empty = 空状態(US-C3)
  screens: ("list" | "detail" | "create" | "confirm" | "empty")[];
  operations: ("create" | "update" | "delete" | "changeStatus")[];
};

type GateStatus = "PASS" | "FAIL" | "PENDING" | "ERROR";
type GateResult = { pillar: "test" | "static" | "security" | "deploy"; status: GateStatus; details: string };
```

## (A) ツール側 主要メソッド

```ts
// TC-3 IntentParser
interface IntentParser {
  parse(naturalLanguage: string): Result<IntentModel, MissingInfoError>; // 欠落→差し戻し(US-A2 AC3)
}

// TC-5 CodeGenerator
interface CodeGenerator {
  generate(model: IntentModel): Promise<GenOutput>; // {files, traceability: Map<intentItem, filePaths>}
}

// TC-11 CodeGenProvider（差し替え可能な抽象境界）
interface CodeGenProvider {
  complete(prompt: string, context: GenContext): Promise<string>;
}

// TC-6 QualityGateRunner（fail-closed, ADR-005）
interface QualityGateRunner {
  run(target: Project): Promise<{ results: GateResult[]; passed: boolean }>; // passed = 全柱PASSのAND
}

// TC-7 AutoFixLoop（最大3試行, ADR-006）
interface AutoFixLoop {
  run(project: Project, maxAttempts: 3): Promise<{ converged: boolean; attempts: number; lastResults: GateResult[] }>;
}

// TC-8 EscalationHandler
type EscalationChoice = "rerun-intent" | "manual-resubmit" | "abort";
interface EscalationHandler {
  prompt(lastResults: GateResult[]): Promise<EscalationChoice>; // abort→ProjectStore.save
}

// TC-9 Deployer（FR-4）— 冪等。同一スタックを再利用し差分デプロイ（自動修正の反復デプロイに耐える, finding-3）
interface Deployer {
  deploy(project: Project): Promise<DeployResult>; // {url, health: {status:number, ms:number}} | DeployFailure{reason, rolledBack}
}
// 注: AutoFixの再評価でデプロイ柱を再実行する場合、初回作成済みスタックへの差分(update)デプロイとし、毎回フル作成しない（コスト/時間の抑制, ADR-006関連）。
```

## (B) 生成アプリ側 代表メソッド（参照CRUD: Task）

```ts
// AC-4 Repository（DynamoDB）
interface TaskRepository {
  list(): Promise<Task[]>;
  get(id: string): Promise<Task | null>;
  create(input: NewTask): Promise<Task>;
  update(id: string, patch: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
}

// AC-2 API（Hono on Lambda）— 入力検証を境界で実施(NFR-2.2)
// GET /tasks, GET /tasks/:id, POST /tasks, PUT /tasks/:id, DELETE /tasks/:id
// 各ハンドラはスキーマ検証→Service→Repository。エラーは構造化レスポンス(construction phaseルール)。
```

## エラーハンドリング方針（境界）
- 統合境界（AI呼び出し/AWS/DB/外部）は必ずエラーを捕捉し、`Result`型または構造化エラーで上位へ（construction phaseルール）。
- デプロイ失敗は `DeployFailure` として fail-closed に伝播（FR-4.3）。
- 沈黙の失敗を禁止（ログ＋呼び出し元への可視化）。
