# External Dependency Map — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Upstream: `raid-log.md`(Dependencies), `decisions.md`, `bolt-plan.md`
> 外部依存と「いつまでに確保すべきか」。

## 外部依存一覧

| ID | 依存 | 用途 | 必要Bolt | 確保アクション |
|----|------|------|----------|----------------|
| D-1 | AIモデル/プロバイダ | コード生成・自動修正（CodeGenProvider背後） | Bolt 1 | APIキー/エンドポイント設定。抽象境界で差し替え可（ADR-004） |
| D-2 | AWSアカウント/IAM | デプロイ柱・本番配信 | Bolt 1 | アカウント・最小権限ロール・認証情報（US-D1で確認） |
| D-3 | GitHub Actions (CI) | マージ前の4柱実行 | Bolt 1 | リポジトリCI設定、required checks |
| D-4 | セキュリティスキャナ | npm audit/Trivy/gitleaks/Semgrep | Bolt 1 | OSS導入（無償）。CIに組込 |
| D-5 | テスト/Lint/型ツール | Vitest/Playwright/ESLint/Prettier/tsc | Bolt 1 | OSS依存（npm） |
| D-6 | AWS CDK | IaC・デプロイ | Bolt 1 | CDK CLI/bootstrap |

## クリティカル依存（Bolt 1ブロッカー）

- **D-1, D-2 が最重要:** AIモデル（生成の主体）とAWS（デプロイ柱）が無いと walking skeleton が1回転しない。Bolt 1着手前に確保必須。
- D-3〜D-6 はOSS/標準で入手容易だが、CI統合（fail-closed）はBolt 1のDoDに含む。

## リスクと代替

| 依存 | リスク | 代替/緩和 |
|------|--------|-----------|
| D-1 AIモデル | 提供変更・品質変動（R-3） | CodeGenProvider抽象で差し替え（特定SDK密結合を回避） |
| D-2 AWS | コスト/権限 | サーバレス従量で最小化。最小権限IAM。staging先行 |
| D-4 スキャナ | 偽陽性/メンテ | 複数ツール併用、閾値はrequirements基準（High0等） |

## 確保タイムライン
```
[Bolt 1 着手前] D-1(AIモデル), D-2(AWS), D-6(CDK bootstrap) を確保
[Bolt 1 内]     D-3(CI), D-4(スキャナ), D-5(テスト/Lint) を統合（fail-closed DoD）
```
<!-- Text fallback: 外部依存はAIモデル/AWS/CI/スキャナ/テストLint/CDK。D-1(AI)とD-2(AWS)がBolt1のクリティカルブロッカーで着手前に確保。CI/スキャナ統合はBolt1のDoD。 -->
