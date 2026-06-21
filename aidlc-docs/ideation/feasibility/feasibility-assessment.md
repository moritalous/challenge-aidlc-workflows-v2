# Feasibility Assessment — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Perspectives synthesized: aidlc-architect-agent (lead), aidlc-aws-platform-agent, aidlc-compliance-agent
> Upstream: `intent-statement.md`, `competitive-analysis.md`, `market-trends.md`, `build-vs-buy.md`

## 総合判定: 実現性 HIGH（技術的に十分実現可能）

`intent-statement.md` の中核（完全AI生成でも本番品質を自動担保する雛形）と `build-vs-buy.md` の方針（成熟コンポーネントはbuy、統合とガードレールはbuild）を踏まえると、本イニシアチブは**既存の成熟技術の組合せ＋オーケストレーション**で実現でき、新規研究要素は不要。最大の不確実性は技術ではなく「AI生成物の品質ばらつきを仕組みで吸収できるか」という設計課題に集約される。

## 技術的実現性（Architect視点）

| 領域 | 実現性 | 根拠 |
|------|--------|------|
| AIによるコード生成 | 高 | 既製の高性能モデル/エージェントで実用水準（market-trends.md） |
| TSフルスタック雛形 | 高 | create-next-app等の成熟スターターを土台にできる（competitive-analysis.md 層2） |
| 自動品質ゲート | 高 | テスト/Lint/型/セキュリティ/CIは成熟（同 層3）。課題は統合方法 |
| 本番デプロイ(AWS) | 高 | サーバレス構成で本番到達を早められる |
| **差別化中核の統合** | 中〜高 | 「AIが従いやすい型＋合格しないと進めないゲート」の設計が成否を分ける |

**アーキテクチャ方針（ideationレベル）:**
- 雛形は「スターターテンプレート」＋「品質ガードレール（CI上の必須ゲート）」＋「AI生成を導く規約/プロンプト」の3層構成。
- 品質ゲートは "fail-closed"（合格しなければ先に進めない）を原則とし、AI生成のばらつきを構造で吸収する。
- 実装詳細（フレームワーク確定、コンポーネント分割）は application-design / functional-design に委ねる。

## クラウド実現性（AWS Platform視点）

- **既定構成（案）:** フロント= S3 + CloudFront（または同等のSSRホスティング）、API= API Gateway + Lambda、DB= マネージド（DynamoDB もしくは Aurora Serverless v2）、認証= Cognito、IaC= AWS CDK または SAM。
- **Well-Architected 観点:** サーバレス従量でコスト最適化・運用負荷低減。最小権限IAM・暗号化・ログ/トレースを雛形に標準装備する方針。
- **コスト:** 初期は従量課金で小さく開始可能。本番スケール時のコストは infrastructure-design で精査。
- 最終的なサービス選定は **infrastructure-design** で確定（ideationでは固定しない）。

## コンプライアンス／セキュリティ実現性（Compliance視点）

- 強い規制レジーム（PCI/HIPAA等）は現状未指定。ただし「完全AI生成」ゆえに**生成物のセキュリティ担保**が重要。
- 雛形の標準セキュリティゲート: 依存脆弱性スキャン、シークレット検出、SAST、入力検証、OSSライセンスチェック。
- データ分類・レジデンシは将来の横展開（組織利用）で要件が増す想定。現段階は「安全側の既定（暗号化・最小権限）」を雛形に組み込む。

## 主要な不確実性と緩和

1. **AI生成品質のばらつき** → fail-closed な自動ゲート＋テスト強制で吸収（中核設計）。
2. **対象アプリ形態の拡散（スコープクリープ）** → まず1つの代表構成（フルスタックTS）に絞り、walking skeletonで実証してから広げる。
3. **AIツール領域の高速変化** → モデル/ツールを差し替え可能な抽象境界で疎結合化（design for change）。

## 結論

技術的・クラウド的・コンプライアンス的にいずれも実現可能。**Go**。次フェーズ（scope-definition）で提供形態と品質ゲートの合格基準を確定し、まず最小の本番品質スライス（walking skeleton）で中核テーゼを実証することを推奨。

<!-- Text fallback: 実現性は総合HIGH。新規研究要素なし、成熟技術の統合で実現可能。最大の論点はAI生成物のばらつきをfail-closedな自動ゲートで吸収する設計。AWSはサーバレス既定、セキュリティゲートを標準装備。結論はGo。 -->
