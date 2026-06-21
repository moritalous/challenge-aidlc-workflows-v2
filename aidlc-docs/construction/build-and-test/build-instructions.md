# Build Instructions — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Stack: TypeScript / npm workspaces。前提: Node ≥20, npm。

## セットアップ
```bash
npm install            # ルートで全workspace依存を解決
```

## ビルド
```bash
npm run build          # 全workspaceをtscビルド（--if-present）。webはViteバンドル。
```

- `packages/contracts` → `packages/scaffold-cli` → `templates/task-app/*` の順に依存解決（workspace参照）。
- 生成物は各パッケージの `dist/`（gitignore）。Lambda配布は `templates/task-app/api/dist`。

## 型チェック / Lint / フォーマット
```bash
npm run typecheck      # tsc --noEmit 全workspace（strict）
npm run lint           # ESLint（.ts/.tsx）
npm run format:check   # Prettier 検証
```

## デプロイ（参考: ci-pipeline/deployment段で実行）
```bash
cd templates/task-app/api && npm run build         # Lambda配布物
cd templates/task-app/infra && npx cdk synth        # CFNテンプレート生成
npx cdk deploy AppStack                              # staging（OIDC/IAM前提）
```

## 環境変数
- `TABLE_NAME`, `AWS_REGION` は Lambda 実行時に注入（`.env.example` 参照）。シークレットはコードに置かない（SEC-T5）。
