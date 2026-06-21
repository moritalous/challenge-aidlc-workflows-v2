# Architecture Decision Records — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Lead: aidlc-architect-agent / Support: aidlc-aws-platform-agent, aidlc-design-agent
> Upstream: `requirements.md`, `stories.md`, `team-practices.md`, `constraint-register.md`
> 各ADR: Context / Decision / Consequences / Alternatives Rejected

## ADR-001: 雛形の構造 = CLIオーケストレータ + テンプレート + ガードレール

- **Context:** 提供形態D（repo+品質ゲート+AI生成ワークフロー, scope D-06）。完全AI生成前提（TC-1）でfail-closed品質ゲート（TC-4）を統合する必要。
- **Decision:** 雛形を3部構成にする — ①CLIオーケストレータ（意図→生成→ゲート→デプロイを駆動）②スターターテンプレート（生成アプリの土台）③品質ガードレール（CI上の必須ゲート定義）。
- **Consequences:** 関心が分離され、テンプレート/モデルを差し替えても中核ループを再利用できる（design for change）。CLIが単一の制御点となり、人間の承認ポイントを集約できる。
- **Alternatives Rejected:** (a)IDEプラグインのみ＝環境依存が強い。(b)純粋なrepoテンプレートのみ＝AI生成フローとfail-closed統合を表現できない。

## ADR-002: 生成アプリのスタック = React+Vite / Hono on Lambda / DynamoDB / AWS CDK

- **Context:** モダンTSフルスタック＋本番AWSサーバレス（intent Q7, TC-2/TC-3）。本番到達を早め、コストを従量最小化したい。
- **Decision:**
  - フロント: **React + Vite**（SPA） → S3 + CloudFront 配信
  - API: **Hono on AWS Lambda** + API Gateway（軽量・型安全・コールドスタート小）
  - DB: **DynamoDB**（サーバレスネイティブ、運用レス）
  - IaC: **AWS CDK (TypeScript)**（アプリと同一言語、型安全）
  - 言語横断: TypeScript で統一
- **Consequences:** 全層TSで一貫し、AIが生成・型検証しやすい。サーバレスで運用負荷とコストを抑制。CDKでデプロイ可能性ゲート（FR-4）を型安全に表現。
- **Alternatives Rejected:** (a)Next.js フルスタック＝SSR/サーバ要素がサーバレス境界を複雑化、skeletonには過剰。(b)Express＝Lambda最適化でHonoに劣る。(c)Aurora Serverless＝小規模skeletonにはDynamoDBより重い/高コスト。(d)SAM＝CDKの型安全・言語統一に劣る。

## ADR-003: 品質ゲートのツールチェーン（4本柱）

- **Context:** 4本柱fail-closed（project.md Mandated, NFR-1/2）。定量基準（カバレッジ≥80%、脆弱性High0等, requirements）。
- **Decision:**
  - テスト: **Vitest**（ユニット/統合）＋ **Playwright**（E2E）。カバレッジは Vitest coverage。
  - 静的解析/型: **TypeScript(tsc)** ＋ **ESLint** ＋ **Prettier**（team-practices: TS=Prettier+ESLint）。
  - セキュリティ: 依存=**npm audit / Trivy**、シークレット=**gitleaks**、SAST=**Semgrep**。
  - デプロイ可能性: **CDK deploy**（実デプロイ）＋ ヘルスチェック（HTTP200/5秒, FR-4.2）。
  - CI: **GitHub Actions**（マージ前に全柱を実行, team-practices）。
- **Consequences:** いずれも成熟OSS（build-vs-buy: buy）。fail-closedはCIのrequired checksとCLIのゲート判定の二重で担保。
- **Alternatives Rejected:** Jest（Vitestの方がVite親和・高速）、Snyk(有償前提を避けOSS優先)。

## ADR-004: AI生成の抽象境界（モデル差し替え可能）

- **Context:** AIツール領域は急変（RAID R-3）。特定モデルへの密結合を避けたい（design for change, reversibility）。
- **Decision:** コード生成・自動修正は **`CodeGenProvider` インターフェース**の背後に隔離し、具体モデル/SDKを差し替え可能にする。意図解析の出力は**`IntentModel`という安定スキーマ**で固定。
- **Consequences:** モデル更新やプロバイダ変更が中核ループに波及しない。`IntentModel`がツール内の契約となり各コンポーネントが疎結合化。
- **Alternatives Rejected:** 特定LLM SDKを各所で直接呼ぶ＝変更時に全面改修、テスト困難。

## ADR-005: fail-closed の実装 = 純粋判定関数 + パイプライン停止

- **Context:** 「合格しなければ進めない」を確実に（FR-2.2）。部分合格を成功に見せない（US-B2 AC3）。
- **Decision:** 各柱は `GateResult{pillar, status: PASS|FAIL|PENDING|ERROR, details}` を返す純粋関数。`QualityGateRunner` は**全柱がPASSのときのみ** next を返す（AND合成）。PENDING/ERRORは非PASSとして扱う。
- **Consequences:** 判定が決定論的でテスト容易。順不同・並列実行可（FR-2.1）。誤認防止が型で担保。
- **Alternatives Rejected:** 例外ベースの中断＝状態が不明瞭でテスト困難。

## ADR-006: 自動修正ループの試行カウントとリセット

- **Context:** requirements未確定点（FR-2.4「意図修正再実行」後のカウント扱い）。
- **Decision:** 自動修正カウンタは**ゲート全体で最大3試行**。利用者が「意図修正再実行」を選んだ場合は**新規実行とみなしカウンタをリセット**。「手動修正再投入」は同一実行の継続とみなし**カウンタは継続しない（再投入後は再び最大3試行）**＝いずれも人手介入後はリセット。
- **Consequences:** 無限ループを防ぎつつ、人の介入後はAIに再挑戦の余地を与える。
- **Alternatives Rejected:** 介入後もカウンタ継続＝人が直したのにすぐ打ち切られ体験が悪い。

> a11y宿題（refined-mockups）: color.primary/dangerのWCAG AA適合は本設計のデザイントークン確定時に検証する（NFR-5.1）。
