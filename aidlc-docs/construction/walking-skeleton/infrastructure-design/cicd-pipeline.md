# CI/CD Pipeline (Infra View) — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `nfr-design/*`, `tech-stack-decisions.md`, `aidlc-team.md`(deploy-on-merge)
> GitHub Actions による4本柱ゲート＋デプロイ。詳細なジョブ定義は ci-pipeline / deployment-pipeline stage で確定。本stageはインフラ観点の配置。

## パイプライン段（4本柱 fail-closed）

```
push/PR → [install] → [4本柱を並列ジョブで実行]
  ├ test:      Vitest(unit/integration) + Playwright(E2E)  → カバレッジ≥80%
  ├ static:    tsc --noEmit + ESLint + Prettier --check     → エラー0
  ├ security:  npm audit + Trivy + gitleaks + Semgrep        → High/Crit=0, secrets=0
  └ deploy(検証): cdk synth + cfn検証                          → テンプレート妥当
→ [gate] 4ジョブ全green(AND)のみ次へ（fail-closed, BR-T1）
→ merge to main → [deploy staging] cdk deploy AppStack → スモーク(/health 200)
→ 本番は手動承認ゲート（後続）
```
<!-- Text fallback: push/PRでinstall後に4本柱(test/static/security/deploy検証)を並列実行。全green(AND)のみゲート通過。mainマージでstagingへcdk deploy、スモーク後に本番は手動承認。 -->

## 必須ゲート設定（project Mandated）
- 4本柱は **required status checks**。1つでもFAILならマージブロック（fail-closed, merge不可）。
- PENDING/ERROR も非PASS扱い（required checkが完了PASSでなければブロック）。

## デプロイ（org/team rule）
- **deploy-on-merge**: main マージで staging へ自動デプロイ。
- **本番**: 別途手動承認（tech lead + product owner 相当、CodePipeline/環境保護）。
- squash-merge で各Boltを main に1コミット統合（team WoW）。

## シークレット管理（SEC-T5）
- AWS認証は GitHub Actions OIDC → IAM ロール引き受け（長期キーを置かない）。
- CodeGenProvider のAPIキー等は GitHub Secrets / Secrets Manager 経由。リポジトリに平文を置かない。

## スコープ注
- ジョブのYAML実体・キャッシュ戦略・マトリクスは **ci-pipeline stage** で生成。本stageは段構成とゲート方針を固定。
