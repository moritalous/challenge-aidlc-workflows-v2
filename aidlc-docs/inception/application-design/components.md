# Components — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Upstream: `requirements.md`, `stories.md`, `decisions.md`
> 2層構成: (A)雛形ツール（CLIオーケストレータ） と (B)生成アプリのテンプレート。

## (A) 雛形ツール側コンポーネント

| ID | コンポーネント | 責務 | トレース |
|----|----------------|------|----------|
| TC-1 | CLIShell / SetupWizard | 起動・初回セットアップ・AWS認証確認・2回目以降スキップ | US-D1, FR-6.1/6.2/6.3 |
| TC-2 | TemplateScaffolder | スターター適用・競合検出（上書きせず中断） | US-C1, FR-3.1/3.2/3.3 |
| TC-3 | IntentParser | 自然言語意図 → `IntentModel`（entities/screens/operations）。欠落検出 | US-A1, FR-1.1; US-A2 AC3 |
| TC-4 | IntentReviewPresenter | 要約提示・承認/編集ループ | US-A1 AC2/AC3, FR-1.2 |
| TC-5 | CodeGenerator | `IntentModel` → コード生成（`CodeGenProvider`経由）＋トレーサビリティ対応表 | US-A2, FR-1.3/1.4 |
| TC-6 | QualityGateRunner | 4柱を実行しAND合成、fail-closed判定 | US-B1, FR-2.1/2.2 |
| TC-6a | TestGate | Vitest/Playwright実行・カバレッジ判定(≥80%) | NFR-1.1 |
| TC-6b | StaticAnalysisGate | tsc/ESLint/Prettier（型0・lint0） | NFR-1.2 |
| TC-6c | SecurityGate | npm audit/Trivy・gitleaks・Semgrep（High0/secret0） | NFR-2 |
| TC-6d | DeployabilityGate | CDK deploy＋ヘルスチェック | NFR-1.3, FR-4.2 |
| TC-7 | AutoFixLoop | 不合格時にAI修正→全柱再評価、最大3試行 | US-B2, FR-2.3, ADR-006 |
| TC-8 | EscalationHandler | 3択（意図修正再実行/手動再投入/中断保存） | US-B3, FR-2.4 |
| TC-9 | Deployer | CDK synth/deploy・公開URL・ヘルスチェック・失敗ロールバック | US-C2, FR-4.1/4.3/4.4 |
| TC-10 | GateReporter | 4状態＋ERRORの可視化（記号＋テキスト、色非依存） | US-D2, FR-6.4, NFR-5.1 |
| TC-11 | CodeGenProvider (interface) | AIモデル/SDKの抽象境界（差し替え可能） | ADR-004 |
| TC-12 | ProjectStore | 生成物・進捗の保存／中断再開 | US-B3 AC2 |

## (B) 生成アプリ側テンプレート構成（雛形が出力する型）

| ID | コンポーネント | 責務 | スタック(ADR-002) |
|----|----------------|------|--------------------|
| AC-1 | Web Frontend | 画面（ログイン/一覧/詳細/空状態/確認） | React + Vite |
| AC-2 | API Handlers | CRUD APIエンドポイント・入力検証 | Hono on Lambda |
| AC-3 | Domain/Service層 | ビジネスロジック（薄い縦切り1リソース） | TypeScript |
| AC-4 | Data Access | DynamoDBアクセス（Repository） | DynamoDB SDK |
| AC-5 | Auth Stub | シードユーザー前提のログイン（本格認証は将来） | （スタブ） |
| AC-6 | IaC | スタック定義（S3/CloudFront/APIGW/Lambda/DynamoDB） | AWS CDK |
| AC-7 | Quality Config | テスト/Lint/型/セキュリティ/CIの設定一式 | Vitest/ESLint/Actions等 |

## レイヤー境界（生成アプリ）

```
[Web Frontend] --HTTP--> [API Handlers] --> [Domain/Service] --> [Data Access] --> (DynamoDB)
                                |                                   
                          入力検証(境界)                       Repository境界
```
<!-- Text fallback: 生成アプリはFrontend→API Handlers(入力検証)→Domain/Service→Data Access(Repository)→DynamoDB の層構成。 -->

## 設計原則の適用
- **疎結合:** TC-11(CodeGenProvider)でAIを隔離、IntentModelで契約固定（ADR-004）。
- **高凝集:** 各Gate(TC-6a〜d)は単一柱に責務集中。
- **fail-closed:** TC-6がAND合成で全PASSのみ前進（ADR-005）。
- **層分離:** 生成アプリはhandlers/services/repositoriesを分離（team-practices code style）。
