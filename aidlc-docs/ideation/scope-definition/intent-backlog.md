# Intent Backlog (proto-Units) — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> 優先度: MoSCoW。シーケンス: リスクファースト（中核テーゼの実証を最優先）
> Upstream: `scope-document.md`, `intent-statement.md`, `constraint-register.md`

これは Units Generation で正式な Unit へ精緻化する前の **proto-Unit（意図バックログ）** である。

## Must-have（中核 — walking skeletonに含む）

| ID | proto-Unit | 説明 | 根拠/トレース |
|----|------------|------|----------------|
| B-1 | スターターテンプレート基盤 | TSフルスタック（フロント+API+DB）の最小土台 | TC-2, scope In |
| B-2 | AI生成ワークフロー（最小） | 意図→コード生成→検証→デプロイの一連を回す仕組み | Q2=C, 中核テーゼ |
| B-3 | 品質ゲート: テスト | ユニット/統合/E2Eの自動テストをCIで必須化 | 品質柱① TC-4 |
| B-4 | 品質ゲート: 静的解析・型 | Lint/型/フォーマットをCIで必須化 | 品質柱② |
| B-5 | 品質ゲート: セキュリティ | 依存脆弱性/シークレット検出/SAST/入力検証 | 品質柱③ RC-1/2 |
| B-6 | 品質ゲート: デプロイ可能性 | CI通過後にAWSへ実デプロイ（IaC含む） | 品質柱④ TC-3 |
| B-7 | CIオーケストレーション（fail-closed） | 4本柱を「合格しなければ進めない」型に統合 | TC-4 中核 |

> B-1〜B-7 が **walking skeleton** を構成する（薄い縦切りで端から端まで1回転）。

## Should-have（skeleton後、早期に）

| ID | proto-Unit | 説明 |
|----|------------|------|
| B-8 | 認証・認可の標準装備 | Cognito等による安全な既定（RC-3） |
| B-9 | 代表的CRUD機能のひな型 | 一覧/詳細/作成/更新/削除のパターン |
| B-10 | 観測性の最小装備 | ログ/メトリクス/トレースの既定 |
| B-11 | 利用ドキュメント | 個人が使い始められるREADME/ガイド |

## Could-have（あれば嬉しい）

| ID | proto-Unit | 説明 |
|----|------------|------|
| B-12 | AI生成プロンプト/規約の洗練 | 生成品質を高めるガードレール強化 |
| B-13 | コスト/性能の最適化テンプレ | サーバレス最適化の既定 |

## Won't-have（今回は対象外）

- 多アプリ形態の一般化、組織配布基盤、非エンジニア向けUI、マルチクラウド、重い規制対応（scope Out と一致）。

## Value Stream（capability → outcome）

```
意図(自然言語) --> AI生成 --> 4本柱品質ゲート(fail-closed) --> AWSデプロイ --> 本番品質アプリ
       |                                                              |
   速度の源泉                                                  品質・本番到達の源泉
```
<!-- Text fallback: バリューストリームは「意図→AI生成→4本柱ゲート→AWSデプロイ→本番品質アプリ」。前半が速度、後半が品質を担保。Must(B1-7)がwalking skeleton、Should(B8-11)が早期追加、Could(B12-13)、Won't=scope Out。 -->

## Delivery視点メモ

- Must群（B-1〜B-7）は相互依存が強く、walking skeleton として**1つのまとまり**で実証するのが妥当（delivery-planningでBolt化）。
- リスクファーストのため、B-2（AI生成フロー）とB-7（fail-closed統合）が最重要かつ最不確実。ここを最初に潰す。
