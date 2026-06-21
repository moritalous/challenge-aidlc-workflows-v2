# Unit Test Instructions — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Runner: Vitest。戦略: Standard（コンポーネント毎5-8件）。

## 実行
```bash
npm run test                       # node環境スイート（scaffold-cli + api + infra）
npm -w @vibe-app/web run test      # web（jsdom環境、別config）
npm run test:coverage              # node環境のカバレッジ（しきい値80%）
npm -w @vibe-app/web run test -- --coverage   # webカバレッジ（しきい値80%）
```

## 対象と観点（(A)雛形ツール）
- `evaluate.ts`: fail-closed（全PASSのみ合格 / PENDING・ERROR非PASS / 部分合格不合格 / 順序非依存）。
- `quality-gate.ts`: 4柱並列、throw/timeout→ERROR正規化、常に4結果。
- `parser.ts`: 正常解析 / 欠落検出(BR-T4) / changeStatus保持。
- `generator.ts`/`template-provider.ts`: Provider差替 / traceability(filePaths)。
- `orchestrator.ts`: happy(全PASS→Deploying) / 非PASS→HaltForHuman（自動修正しない）。
- `deployer.ts`: 注入したcdk/smokeでの成功/失敗・ロールバック手順。
- `project-store.ts`: 保存/読込・エラー包装。

## 対象と観点（(B)生成アプリ）
- `task-service.ts`: 作成(既定Todo) / 過長title拒否 / status更新(changeStatus=update) / 未存在NotFound。
- `routes/tasks.ts`: CRUD + 不正入力400(zod境界検証)。
- `dynamo-task-repository.ts`: **Query-not-Scan**（gsi1）/ gsi1pk付与・除去 / RepositoryError包装。
- web: 一覧/空状態/読込/保存成功バナー/削除確認/保存失敗時入力保持/ログインstub(無効資格→aria-alert)。

## カバレッジ方針
- コアロジック ≥80%（NFR-1.1）。型定義(contracts)・エントリ配線(cli/runners/lambda/bin/main)はカバレッジ対象外（理由をconfigに明記）。
- happy path＋最低2エラー/エッジを各機能でカバー（construction phaseルール）。`assert true` 禁止。
