# Build vs Buy vs Partner — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate) ／ Source: アナリスト評価
> Upstream: `intent-statement.md`（核心=速度と品質の両立／品質4本柱／TSフルスタック+AWS）

## 判断の原則

**既成の成熟コンポーネントは buy/組合せ、差別化の中核（統合とガードレールの型）は build。** 車輪の再発明を避け、本イニシアチブ固有価値に投資を集中する。

## コンポーネント別の判断

| 要素 | 判断 | 根拠 |
|------|------|------|
| LLM / AIエージェント | **Buy** | 既製の高性能モデル/SDKを利用。自前学習は不要 |
| コードスキャフォールド基盤 | **Buy/組合せ** | create-next-app等のスターターやモノレポ基盤を土台に活用 |
| テストランナー | **Buy** | Vitest/Playwright等の標準を採用 |
| Lint・型・フォーマット | **Buy** | ESLint/Biome/TypeScript/Prettier 等の標準 |
| セキュリティスキャン | **Buy** | SAST/依存脆弱性/シークレット検出の既製ツール |
| CI/CD | **Buy** | GitHub Actions 等のマネージドCI |
| 本番デプロイ基盤(AWS) | **Buy** | AWSサーバレス/マネージドサービス |
| **品質ガードレールの統合・オーケストレーション** | **Build（中核）** | 「AIが従いやすい型＋合格しないと進めない自動ゲート」は既製品が薄い差別化領域 |
| **AI生成を導く雛形・規約（AI-DLC的ワークフロー）** | **Build（中核）** | 完全AI生成前提の型・プロンプト/制約設計が独自価値 |
| 配布・オンボーディング(将来) | **Partner/後続** | 横展開フェーズで検討（construction/operation以降） |

## 結論

- **Buy:** AIモデル、スターター基盤、テスト/Lint/型/セキュリティ/CI/AWS — いずれも成熟した既製を採用。
- **Build:** これらを束ねて「完全AI生成でも本番品質を強制する雛形＋ガードレールの型」を構築する。ここが唯一の差別化投資先。
- **Partner:** 現段階では不要。将来の組織横展開時に配布・教育面で検討。

> この build/buy 配分は ideation の方針。具体的なツール選定・構成確定は feasibility / application-design / infrastructure-design で行う（ideationフェーズでは実装詳細を固定しない）。

<!-- Text fallback: 成熟コンポーネント(AIモデル/スターター/テスト/Lint/型/セキュリティ/CI/AWS)はbuy。差別化中核である品質ガードレールの統合とAI生成を導く雛形の型はbuild。partnerは将来の横展開時のみ。 -->
