# Reliability Requirements — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `requirements.md`(NFR-1/NFR-4), `business-rules.md`(BR-T1/BR-T6), `business-logic-model.md`
> 2層で記述: (A)雛形ツール / (B)生成アプリ。

## (A) 雛形ツールの信頼性要件

| ID | 要件 | 目標 | 典拠 |
|----|------|------|------|
| REL-T1 | fail-closed 保証 | 4柱いずれか非PASSなら絶対に次工程へ進めない（AND合成・PENDING/ERROR=非PASS） | BR-T1 / NFR-1 / project Mandated |
| REL-T2 | 再現性 | 同一意図から同等構成のアプリを再現生成（人/セッション依存を低減） | NFR-4.1 |
| REL-T3 | デプロイ冪等性 | 再デプロイは同一スタックへの差分update。失敗時はロールバックまたは手順提示 | BR-T6 / FR-4.4 |
| REL-T4 | 統合境界の堅牢性 | AI/AWS/DB 呼び出しは捕捉し `Result`/構造化エラーで上位へ。沈黙の失敗禁止 | construction phase |
| REL-T5 | ゲート非PASS時の安全停止 | skeletonは自動修正なし。`HaltForHuman` で1回停止し理由提示（BR-T1'）。進捗は失わない | F6 / unit-of-work L74/L78 |

- skeletonでは自動修正リトライ(U6)・3分岐エスカレーションを含まない。エスカレーション時の中断保存(abort→ProjectStore.save)は U6 実装時に有効化（BR-T7）。
- 「合格に見せない」保証（PENDING/ERRORを合格扱いしない）は典拠 US-D2 AC2/AC3 として REL-T1 に内包。

## (B) 生成アプリ（Task CRUD）の信頼性要件

| ID | 要件 | 目標 | 典拠 |
|----|------|------|------|
| REL-A1 | 可用性（SLO） | 99.9% 可用性 / 30日ローリングウィンドウ（確定値。アラート閾値・ロールバック機構は observability-setup へ委譲） | operation phase: SLO定量化 |
| REL-A2 | ヘルスチェック | デプロイ後 HTTP 200 / ≤5秒 のスモークテスト必須 | FR-4.2 / NFR-1.3 |
| REL-A3 | 障害時の挙動 | API失敗は構造化エラーを返し、フロントは入力値保持＋AlertBanner表示 | BR-A4 / frontend-components |
| REL-A4 | データ耐久性 | DynamoDB のマネージド冗長性に委譲。skeletonで独自バックアップは作らない | サーバーレス既定 |
| REL-A5 | グレースフルデグラデーション | 一覧取得失敗時も空状態/エラー表示でクラッシュしない | frontend states(loading/empty/error) |

- REL-A1 の SLO/アラート閾値・ロールバック手順は infrastructure-design / observability-setup（operation phase）で具体化。skeletonでは目標値の宣言に留める。
- バックアップ/DR の詳細手順は後続Bolt（本番化フェーズ）で確定。
