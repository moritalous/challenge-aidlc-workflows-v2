# Units of Work — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Lead: aidlc-architect-agent / Support: aidlc-delivery-agent
> Upstream: `components.md`(TC/AC), `component-dependency.md`, `requirements.md`, `stories.md`
> Unit = 独立に実装・テスト可能な作業パッケージ。Bolt化は delivery-planning。

## U0: Shared Contracts（共有カーネル — 最初に定義）
- **含む:** `IntentModel`, `GateResult`, **`Project`/`BuildArtifact` 契約**（生成プロジェクトの形＝ファイル群＋IaCエントリ＋メタ）。
- **責務:** 各Unitが依存する安定した型契約を1か所に定義し、Unit間の直接依存（特にDeployer↔テンプレート）を**契約シーム**で切る。
- **独立性:** 純粋な型定義。最初に確定させ、以降のUnitはこの契約のみに依存。
- **F1/F2対策:** U7(Deployer)はU8(テンプレート)に直接依存せず、`Project`契約に依存する（循環の遮断）。

## U1: CLI & Setup（ツールの骨格）
- **含むコンポーネント:** TC-1(CLIShell/SetupWizard), TC-2(TemplateScaffolder), TC-12(ProjectStore)
- **責務:** CLI起動、初回セットアップ/AWS認証確認、2回目以降スキップ、スターター適用＋競合検出、中断/再開の保存。
- **独立性:** 単体でCLIが起動・設定保存・スキャフォールド可能（生成ロジックなしでも検証可）。
- **テスト境界:** セットアップ成功/失敗、競合検出、再起動スキップ。

## U2: Intent Pipeline（意図→モデル）
- **含む:** TC-3(IntentParser), TC-4(IntentReviewPresenter), TC-11(CodeGenProvider interface)
- **責務:** 自然言語→`IntentModel`、要約提示・承認/編集ループ、AI抽象境界の定義。**必須情報の欠落検出は生成前（U2内）で完結**し、欠落時は要約確認(US-A1)へ差し戻す（US-A2 AC3の発火はU2の生成前チェック。F8対策）。
- **依存:** U0(契約), U1。
- **独立性:** `CodeGenProvider`をモックして単体検証可能。
- **テスト境界:** 解析成功、編集ループ、必須情報欠落の差し戻し。

## U3: Code Generation（モデル→コード）
- **含む:** TC-5(CodeGenerator)
- **責務:** `IntentModel`→TSフルスタックコード生成、トレーサビリティ対応表、ビルド/型チェック通過確認。
- **依存:** U2(IntentModel/Provider)。
- **テスト境界:** 生成物が型エラー0でビルド通過、対応表出力。

## U4: Quality Gate Framework（fail-closed基盤）
- **含む:** TC-6(QualityGateRunner), TC-10(GateReporter)
- **責務:** 4柱のAND合成、`GateResult`集約、fail-closed判定、4状態+ERRORの可視化（色非依存）。
- **独立性:** ダミーの柱で判定ロジック単体検証可能。
- **テスト境界:** 全PASS前進、部分合格停止、PENDING/ERRORを非PASS扱い。

## U5: Gate Pillars（4本柱の実装）
- **含む:** TC-6a(Test), TC-6b(Static), TC-6c(Security), TC-6d(Deployability)
- **責務:** 各柱を実ツール（Vitest/Playwright・tsc/ESLint/Prettier・Trivy/gitleaks/Semgrep・CDK deploy+health）で実行し`GateResult`を返す。
- **依存:** U4(Runner契約)。U5dはU7(Deployer)を利用。
- **テスト境界:** 各柱のPASS/FAIL判定、定量基準（≥80%、High0等）の適用。

## U6: AutoFix & Escalation（不合格時の回復）
- **含む:** TC-7(AutoFixLoop), TC-8(EscalationHandler)
- **責務:** 最大3試行の修正→全柱再評価、部分合格=不合格、3失敗で3択エスカレーション、中断保存。
- **依存:** U4(再評価), U2/U3(再生成), U1(ProjectStore)。
- **テスト境界:** 1試行で収束、3試行失敗→エスカレーション、各選択肢の挙動（ADR-006のカウントリセット）。

## U7: Deployer（AWSデプロイ柱の実行）
- **含む:** TC-9(Deployer)
- **責務:** `Project`契約（U0）として渡された生成プロジェクト（IaC含む）に対し CDK synth/deploy、公開URL、ヘルスチェック(HTTP200/5秒)、失敗ロールバック、冪等な差分デプロイを実行。
- **依存:** U0(`Project`契約)のみ。**U8には直接依存しない**（契約シーム, F1/F2対策）。生成済みProjectは呼び出し時にデータとして受け取る。
- **テスト境界:** ダミーProjectでデプロイ成功+health、デプロイ失敗+ロールバック、差分update。

## U8: Generated App Template（生成される型, IaC含む）
- **含む:** AC-1(Frontend), AC-2(API), AC-3(Service), AC-4(DataAccess), AC-5(AuthStub), **AC-6(IaC)**, AC-7(QualityConfig)
- **責務:** 参照CRUD（1リソース）テンプレート: React+Vite画面（状態網羅・WCAG AA）、Hono API（入力検証）、DynamoDB Repository、シードユーザー認証スタブ、**自身のIaC(CDK)定義**、品質設定一式。テンプレートは`Project`契約に適合する形（F2: IaCはこのテンプレートが所有）。
- **依存:** U0(`Project`契約に適合)のみ。生成器U3がこのテンプレートを素材に使う（U3→U8の利用は一方向）。
- **独立性:** テンプレートは**自身に同梱したESLint/Vitest/GH Actions設定**だけでビルド/テスト/Lint/セキュリティ/CIが緑になる（ツール側U4/U5ランナーには依存しない自己完結。F5明確化）。
- **テスト境界:** CRUD各操作、削除確認、保存成否、空状態、ログイン失敗、a11y(axe)、同梱CIが緑。

## Unit サマリ

| Unit | 主担当 | サイズ | walking skeleton(Bolt1)包含 |
|------|--------|--------|----------------------|
| U0 Shared Contracts | architect/developer | S | 含む（最初に確定） |
| U1 CLI & Setup | developer | M | 含む（薄く） |
| U2 Intent Pipeline | developer | L | 含む（薄く・1経路） |
| U3 Code Generation | developer | L | 含む（薄く・1リソース生成） |
| U4 Gate Framework | developer/quality | M | 含む |
| U5 Gate Pillars | quality/devsecops | L | 含む（最小4柱） |
| U6 AutoFix & Escalation | developer | M | **含まない**（Bolt 2で肉付け、skeletonは1試行のみの簡易) |
| U7 Deployer | aws-platform | L | 含む（デプロイ柱） |
| U8 Generated App Template | developer/design | L | 含む（生成対象, IaC同梱） |

> **walking skeleton（Bolt 1）の確定メンバー（3成果物で統一）:** {U0,U1,U2,U3,U4,U5,U7,U8} の**薄い1リソース縦スライス**で「意図→生成→4柱→デプロイ」を1回転させる。**U6は含まない**（skeletonは自動修正なしで人手前提、U6はBolt 2で追加）。U8は薄い1リソースCRUDのみskeletonに含む。臨界経路: U0→U1→U2→U3→U4→U5→U7。
