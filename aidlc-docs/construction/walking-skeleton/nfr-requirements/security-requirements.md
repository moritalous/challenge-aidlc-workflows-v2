# Security Requirements — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `requirements.md`(NFR-2), `aidlc-project.md`(Mandated/Forbidden), `business-rules.md`
> 2層で記述: (A)雛形ツール / (B)生成アプリ。

## (A) 雛形ツールのセキュリティ要件

| ID | 要件 | 閾値/規則 | 典拠 |
|----|------|-----------|------|
| SEC-T1 | 依存脆弱性スキャン（npm audit + Trivy） | High/Critical = **0** で合格、>0 で柱FAIL | NFR-2.1 / ADR(品質ゲート) |
| SEC-T2 | シークレット検出（gitleaks） | 検出 = **0**。1件でも柱FAIL | NFR-2.1 / project Forbidden |
| SEC-T3 | SAST（Semgrep） | High指摘 = **0** | NFR-2.1 |
| SEC-T4 | 認証/認可バイパスコードの禁止 | 生成物にバイパス経路があれば不合格 | NFR-2.3 / project Forbidden |
| SEC-T5 | シークレットのハードコード禁止 | 資格情報は環境変数 / Secrets Manager のみ | NFR-2.3 / project Forbidden |

- security柱（SEC-T1〜T3）は4本柱の1つ。fail-closed（BR-T1）: High/Critical脆弱性・検出シークレット・SAST High のいずれかがあれば security柱は非PASS → ゲート全体不合格。
- ツール自身の CodeGenProvider 認証情報・AWS認証情報は環境変数/標準クレデンシャルチェーン経由のみ。コード・テンプレート・ログに出力しない。

## (B) 生成アプリ（Task CRUD）のセキュリティ要件

| ID | 要件 | 規則 | 典拠 |
|----|------|------|------|
| SEC-A1 | 入力検証/サニタイズ | API境界で全入力をスキーマ検証（Hono validator）。不正は400+構造化エラー | NFR-2.2 / BR-A2 |
| SEC-A2 | 認証スタブ | skeletonはシードユーザー前提。本格認証(Cognito等)はスコープ外（FR-7.1） | BR-A5 |
| SEC-A3 | シークレット非格納 | DB接続・APIキー等は環境変数。生成コードにハードコードしない | NFR-2.3 |
| SEC-A4 | 最小権限IAM | Lambda実行ロールは対象DynamoDBテーブルへのCRUDのみ許可 | infrastructure-design / construction Security |
| SEC-A5 | 転送時暗号化 | API Gateway/CloudFront は HTTPS のみ | 既定 |

## 脅威考慮（skeleton範囲）
- 主要境界: ブラウザ→CloudFront→API Gateway→Lambda→DynamoDB。各境界で検証/認可を確認。
- skeletonは認証がスタブのため、本格的な脅威モデリング（STRIDE等）は後続Bolt（認証導入時）で実施。
- インフラ変更のセキュリティ影響は infrastructure-design / operation phase ルールで評価。
