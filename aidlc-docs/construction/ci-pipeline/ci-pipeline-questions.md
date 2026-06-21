# CI Pipeline Questions — Walking Skeleton

> Status: Resolved（上流確定事項から導出、未解決の論点なし）

CI構成は上流で確定済みの方針から一意に導けたため、新規の確認質問は発生しなかった。

## 適用した上流確定事項
- **CIプラットフォーム**: GitHub Actions（application-design ADR / tech-stack-decisions）。
- **デプロイ方針**: deploy-on-merge to staging、本番は手動承認（org/team rule）。
- **ブランチ戦略**: トランクベース（main）、短命ブランチ、squash-merge（team WoW）。
- **品質ゲート**: 4本柱 fail-closed を required checks 化（project Mandated）。
- **認証**: OIDCでAWSロール引受、長期キー不保持（SEC-T5）。
- **セキュリティスキャナ**: npm audit(--omit=dev) + Trivy + gitleaks + Semgrep（security-requirements）。

## 外部環境で必要な設定（質問ではなく前提条件）
- リポジトリ Secrets: `AWS_DEPLOY_ROLE_ARN`。Variables: `STAGING_HEALTH_URL`。
- Branch protection の required checks 設定（quality-gates.md 参照）。
