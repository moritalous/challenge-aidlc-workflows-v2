# Build & Test Results — Walking Skeleton

> Status: Draft (awaiting approval gate)
> 実行日: 2026-06-21 / 環境: Node 22, npm（本sandbox）
> 4本柱 fail-closed ゲートの実測結果。

## サマリ（4本柱）

| 柱 | 結果 | 根拠 |
|----|------|------|
| **テスト** | ✅ PASS | 97テスト全通過（node 80 + web 17）。カバレッジ: コアロジック 96.4%行 / web 98.95%行（各≥80%） |
| **静的解析/型** | ✅ PASS | `tsc --noEmit`(5 workspaces)=0エラー、ESLint=0、Prettier=クリーン |
| **セキュリティ** | ⚠️ 条件付PASS | 本番依存 `npm audit --omit=dev`=**0脆弱性**、シークレット検出=0。dev依存ツールチェーンに脆弱性あり（本番非該当）。Trivy/gitleaks/Semgrep は ci-pipeline で必須化 |
| **デプロイ** | ⏸ 後続段 | `cdk synth` 相当をinfra assertionsで検証。実AWSデプロイ＋スモークは ci-pipeline/deployment-execution |

> 本Boltの skeleton では実AWSデプロイを行わないため、deploy柱の最終判定は ci-pipeline 段。テスト・静的の2柱は本段で GREEN を確認。

## テスト詳細

```
node環境スイート（npm run test）: Test Files 11 passed / Tests 80 passed
web（npm -w @vibe-app/web test）:  Test Files 4 passed / Tests 17 passed
合計: 97 tests passed
```

カバレッジ（v8, しきい値80%）:
- コアロジック（scaffold-cli+api+infra, node run）: **Stmts 96.4 / Branch 82.28 / Funcs 98.21 / Lines 96.4** → 閾値超過、exit 0。
  - 100%: evaluate / quality-gate / generator / template-provider / task-service / errors / api app / task domain / app-stack(stmts)
  - 97.19% orchestrator, 91.6% parser, 90.27% project-store, 84.55% repository, 93.15% routes, 100% deployer
- web（jsdom run）: **Stmts 98.95 / Branch 96.87 / Lines 98.95** → 閾値超過、exit 0。
  - LoginPage 100%（テスト追加で死蔵コード解消）、App.tsx 94.59%、各コンポーネント100%。
- 対象外（理由付）: 型定義(contracts)・エントリ配線(cli/runners/lambda/bin/main) — 実行コードなし or フレームワークエントリ。

## 静的解析詳細
- `tsc -p tsconfig.json --noEmit` × 5 workspaces: 0エラー（strict + noUncheckedIndexedAccess + noImplicitOverride）。
- ESLint（@typescript-eslint）: 0 problem。
- Prettier `--check`: 全ファイル準拠。

## セキュリティ詳細
- `npm audit --omit=dev`（本番依存のみ）: **found 0 vulnerabilities**。
- シークレット検出（grep: AWSキー/秘密鍵/平文password）: **0**。資格情報は env / `.env.example`（実値なし）のみ。
- `npm audit`（全体）: 5件（moderate 2 / high 1 / critical 2）。すべて `esbuild <=0.24.2` 由来で vite→vite-node→vitest→@vitest/coverage-v8 の **dev依存ツリー**。本番ランタイム非該当。解消は vite メジャー更新（破壊的）→後続Boltで検討。
- Trivy / gitleaks / Semgrep: 本sandbox未配備 → ci-pipeline の GitHub Actions ジョブで必須実行（security-test-instructions.md）。

## レビュー指摘の反映
- code-generation の §12a レビューで検出した BLOCKER（list=Scan vs IAM=Query）は修正済み（GSI+Query）。本段の repository テスト6件で Query-not-Scan を固定。
- web の死蔵 LoginPage はテスト追加で解消（カバレッジ反映）。

## 既知のフォローアップ
- CLIエントリ配線（cli.ts/runners.ts）の自動テストは後続Boltで拡充（現状はCLIスモークで観測）。
- dev依存(esbuild)脆弱性の解消（vite更新）。
- 実AWSデプロイ＋スモーク（deploy柱の最終判定）は ci-pipeline/deployment-execution 段。
