# AI-DLC Workflows セットアップ来歴

このプロジェクトには AI-DLC (AI-Driven Development Life Cycle) の Claude Code
ディストリビューションをコピーして配置しています。

## コピー元

- リポジトリ: https://github.com/awslabs/aidlc-workflows
- ブランチ: `v2`
- コミット: `f3ce1b8e976942dfb7701eed7bca046d32c2a978` (`f3ce1b8`)
- バージョン: v2.0.2
- コピー日: 2026-06-21

## コピーした内容

`dist/claude/` から以下を取得:

- `.claude/` — AI-DLC 実装本体（agents / skills / hooks / tools / rules / scopes / sensors / knowledge / CLAUDE.md / settings.json）
- `.mcp.json` — ワークフローが使う MCP サーバ群（context7 / aws-mcp / aws-pricing / aws-iac / aws-serverless）
- `.gitignore` — AI-DLC のランタイム生成物と `settings.local.json` を除外

## 使い方

```bash
claude
```

セッション内で:

```
/aidlc --doctor          # セットアップ検証
/aidlc <作りたいものの説明>   # ワークフロー開始
```

`.claude/settings.json` は AWS Bedrock（`AWS_REGION=us-east-1`）で動作します。
初回実行前に AWS アカウントでモデルアクセスを有効化してください。
