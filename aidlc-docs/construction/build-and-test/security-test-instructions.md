# Security Test Instructions — Walking Skeleton

> Status: Draft (awaiting approval gate)
> security柱（4本柱の1つ, fail-closed BR-T1）。project Mandated: 依存脆弱性/シークレット検出/SASTを必須ゲートで実行。

## スキャン構成（security-requirements 由来）
| スキャナ | 対象 | 合格条件 | 実行 |
|----------|------|----------|------|
| `npm audit` | 依存脆弱性 | 本番依存 High/Critical=0 | `npm audit --omit=dev` |
| Trivy | 依存/イメージ脆弱性 | High/Critical=0 | `trivy fs .`（CIで実行） |
| gitleaks | シークレット検出 | 検出=0 | `gitleaks detect`（CIで実行） |
| Semgrep | SAST | High指摘=0 | `semgrep --config auto`（CIで実行） |

## 本Boltでの実行結果（build-test-results.md 参照）
- `npm audit --omit=dev`（本番依存）: **0 vulnerabilities**。
- シークレット検出（grepヒューリスティック）: **0**（AWSキー/秘密鍵/平文password なし）。コードは env / `.env.example` のみ。
- `npm audit`（全体）: dev依存ツールチェーン（esbuild経由 vite/vitest）に moderate/high/critical あり。**本番ランタイムには非該当**。
- Trivy/gitleaks/Semgrep は本sandboxに未配備 → ci-pipeline段の GitHub Actions ジョブで実行・必須化。

## 方針
- security柱は fail-closed: いずれかのスキャナが High/Critical / シークレット / SAST High を検出すれば柱=FAIL → ゲート全体不合格。PENDING/ERROR も非PASS。
- dev依存の脆弱性は本番非該当だが、ci-pipelineで `npm audit --omit=dev` を必須化し、全体auditは監視（informational）として運用。esbuild系は vite メジャー更新で解消（後続Boltで検討）。
- 認証/認可バイパス・シークレットのハードコードは禁止（project Forbidden）。
