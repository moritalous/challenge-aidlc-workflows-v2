# Business Rules — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `requirements.md`(FR/NFR), `decisions.md`(ADR-005/006)

## (A) 雛形ツールのビジネスルール

### BR-T1: fail-closed ゲート合成（ADR-005）
- 全4柱の `status === "PASS"` のときのみ次工程（デプロイ/完了）へ進む（AND合成）。
- `PENDING` / `ERROR` は **非PASS** として扱い、合格と見なさない（典拠=US-D2 AC2/AC3: 保留・エラーを合格と見せない）。
- 部分合格（4柱中一部のみPASS）も **不合格** 扱い（典拠=US-B2 AC3）。

### BR-T2: 自動修正の試行カウント（ADR-006 / FR-2.3）
- 「1試行」= 修正適用 + 全4柱再評価の1サイクル。カウント単位はゲート全体。
- 最大3試行。いずれかの試行で全柱PASSなら成功し終了。部分合格は不合格として次試行へ。

### BR-T3: エスカレーションとカウントリセット（ADR-006 / FR-2.4）
- 3試行で全柱PASSに至らなければエスカレーション（3択）。
- 「意図修正再実行」「手動修正再投入」いずれも人手介入後はカウンタをリセット（再び最大3試行）。

### BR-T7: エスカレーション3択の遷移（F5 / EscalationChoice / US-B3）
- `rerun-intent`: カウンタをリセットし意図解析(Parsing)から再実行。
- `manual-resubmit`: カウンタをリセットし手動修正を品質ゲート(Gating)で再評価。
- `abort`: `ProjectStore.save` で生成物・進捗を保存して停止。後で再開可能（US-B3 AC2）。U1(ProjectStore)依存はskeleton包含のため実装可能。

### BR-T4: 意図の欠落検出（FR-1.1 / US-A2 AC3）
- `IntentModel` 生成時に entities が空、または必須属性欠落なら、生成前に要約確認へ差し戻す。

### BR-T5: スターター競合（FR-3.3）
- 適用先に競合ファイルがあれば上書きせず中断し、競合一覧を提示。

### BR-T6: デプロイ冪等性（finding-3 / FR-4）
- 再デプロイは同一スタックへの差分(update)。毎回フル作成しない。失敗時はロールバックまたは手順提示（FR-4.4）。

## (B) 生成アプリ（Task CRUD）のビジネスルール

### BR-A1: Task作成（FR-5）
- title 必須（1〜200文字）。status 既定 Todo。dueDate は任意だが指定時は有効な日付。

### BR-A2: 入力検証（NFR-2.2）
- API境界で全入力をスキーマ検証。不正入力は 400 と構造化エラー（construction phaseルール）。

### BR-A3: 削除確認（FR-5.2）
- 削除は確認ダイアログ必須。キャンセル時は変更しない。

### BR-A4: 保存フィードバック（FR-5.3）
- 保存成功/失敗をテキスト通知。失敗時は入力値を保持。

### BR-A5: 認証スタブ（FR-7.1）
- skeletonはシードユーザー前提。不正資格情報はエラー表示・再入力（US-C3 AC4）。本格認証はスコープ外。

## エラーハンドリング方針
- 統合境界（AI/AWS/DB）は必ず捕捉し `Result` 型または構造化エラーで上位へ（沈黙の失敗禁止, construction phaseルール）。
