# Requirements — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Lead: aidlc-product-agent
> Upstream: `intent-statement.md`, `scope-document.md`, `team-practices.md`
> 注: 本プロダクトは「雛形ツール」。要件は (A)雛形ツール自体の振る舞い と (B)雛形が生成するアプリの品質基準 の2層で記述する。受け入れ条件は BDD(Given/When/Then)。

**Project depth**: Standard — 深度に応じて成果物の詳細度が変わります。
**Test strategy**: Standard — テスト戦略がテスト量を制御します。
深度・テスト戦略は任意の承認ゲートで変更できます。

---

## 機能要件 (Functional Requirements)

### FR-1: AI生成ワークフロー（雛形ツールの中核）

- **FR-1.1 意図入力と要約**
  - Given 利用者が自然言語で作りたいアプリの意図を入力する
  - When 雛形ツールが意図を解析する
  - Then エンティティ・画面・主要操作を要約として提示し、承認または編集を求める
- **FR-1.2 意図の承認/編集ループ**
  - Given 要約が提示されている
  - When 利用者が「編集」を選ぶ
  - Then 修正した意図で再解析し、承認まで繰り返せる
- **FR-1.3 コード生成**
  - Given 意図が承認された
  - When 生成を実行する
  - Then TSフルスタックのコード（フロント+API+DB）が生成される
- **FR-1.4 トレーサビリティ**
  - Given 生成が完了した
  - When 成果物を確認する
  - Then 各生成物が意図のどの項目に対応するか追跡できる

### FR-2: 品質ゲート・オーケストレーション（4本柱・fail-closed）【Must / walking skeleton内】

- **FR-2.1 4本柱ゲートの実行**
  - Given コードが生成された
  - When 品質ゲートが起動する
  - Then ①テスト ②静的解析/型 ③セキュリティ ④デプロイ可能性 の全柱を検証する（**順不同で可**。fail-closedの本質は「全柱合格しなければ進めない」こと。実装は並列実行してよい）
- **FR-2.2 fail-closed**
  - Given いずれかの柱が不合格
  - When ゲートが評価される
  - Then 後続（マージ/デプロイ）に進めず停止し、不合格項目と該当箇所を提示する（project.md Mandated準拠）
- **FR-2.3 AI自動修正ループ（発火条件の定義）**
  - **用語定義:** 「1試行」= AIが不合格の柱に対し修正を適用し、**全4柱を再評価する1サイクル**。カウント単位は**ゲート全体**（柱ごとではない）。部分合格（例: 4柱中2柱が合格に転じたが残2柱が不合格）も「不合格」として次の試行に進む（全柱合格で初めて成功）。
  - Given ゲートが不合格で停止した
  - When 自動修正が有効
  - Then AIが**最大3試行**まで「修正→全4柱再評価」を繰り返す。いずれかの試行で全4柱が合格した時点で成功とし修正ループを終える。
- **FR-2.4 エスカレーション（発火条件の定義）**
  - **「失敗」の定義:** 3試行を終えても全4柱合格に至らない状態。
  - Given FR-2.3の3試行すべてで全柱合格に至らなかった
  - When 失敗が確定する
  - Then 利用者へエスカレーションし、[意図修正再実行 / 手動修正再投入 / 中断] の3択を提示する

### FR-3: スターターテンプレート【Must / walking skeleton内】

- **FR-3.1 (happy)** Given 新規プロジェクト When 雛形を適用 Then TSフルスタックの一貫した構成（フロント/API/DB層分離）が生成される
- **FR-3.2 (happy)** Given 生成された雛形 When 検査 Then Lint/型/フォーマット/テスト/セキュリティ/CIの設定が最初から組み込まれている
- **FR-3.3 (error)** Given 適用先ディレクトリが空でない/競合がある When 雛形を適用 Then 上書きせず競合を検出して中断し、競合ファイルを提示する

### FR-4: AWSデプロイ【Must / walking skeleton内】

- **FR-4.1 (happy)** Given 4本柱ゲートを全通過 When デプロイ実行 Then AWS（サーバレス志向）へデプロイされ、公開URLが提示される
- **FR-4.2 (健全性基準)** Given デプロイ完了 When ヘルスチェックを呼ぶ Then 既定ヘルスエンドポイントが **HTTP 200 を 5秒以内**に返す（最終値は infrastructure/performance で確定可）
- **FR-4.3 (error)** Given デプロイが失敗した（プロビジョニング/権限/タイムアウト等） When デプロイ柱が評価される Then **デプロイ柱を不合格**として fail-closed で停止し、失敗理由とロールバック方針を提示する（operation phaseルール: ロールバック手順必須）
- **FR-4.4 (error)** Given デプロイ途中で失敗 When 中断 Then 部分作成リソースを安全な状態に戻す（ロールバックまたは明示的手順提示）

### FR-5: 参照アプリ生成【一覧/詳細=Must(B-9相当の薄い縦切り) / 本格認証=Out（下記FR-7）】

> スコープ明示: walking skeleton には「1リソースのCRUD（一覧/詳細/作成/更新/削除）＋シードユーザー前提のログインスタブ」を含む。本格認証(B-8)は今回スコープ外（FR-7参照）。

- **FR-5.1 (happy)** Given 雛形 When 生成 Then 一覧/詳細編集/作成 のCRUD参照アプリ（1リソース）と、シードユーザー前提のログインスタブが生成される
- **FR-5.2 (error)** Given 詳細画面 When 削除 Then 確認ダイアログを挟む（破壊的操作）。キャンセル時は変更しない
- **FR-5.3 (happy/error)** Given 保存操作 When 実行 Then 成功/失敗をテキストで通知する（失敗時は入力値を保持し再試行可能）
- **FR-5.4 (error)** Given ログインスタブ When 不正な資格情報 Then 「メールまたはパスワードが違います」を入力欄近傍に表示し再入力を促す

### FR-6: CLI/セットアップ体験【Must / walking skeleton内】

- **FR-6.1 (happy)** Given 初回利用 When インストール Then AWS認証情報の確認＋初回セットアップ（リージョン/プロジェクト名）を行う
- **FR-6.2 (error)** Given AWS認証情報が欠落/無効 When 初回セットアップ Then 検出して停止し、設定方法（`aws configure`相当）を案内して再試行を促す（生成・デプロイには進まない）
- **FR-6.3 (happy)** Given 2回目以降 When 起動 Then 意図入力から直接開始できる
- **FR-6.4 (a11y)** Given 品質ゲート実行中 When 結果表示 Then 各柱の合否を記号＋テキストで可視化する（色のみに依存しない）

### FR-7: スコープ境界（除外要件の明文化）

- **FR-7.1** 本格的な認証/認可（サインアップ、Cognito等のIdP統合、パスワードリセット）は **今回スコープ外**。walking skeletonはシードユーザー前提のログインスタブのみを提供する。本格認証は将来Bolt(B-8, Should-have)で追加する。
- **FR-7.2** 複数アプリ形態の一般化、組織配布基盤、非エンジニア向けUI、マルチクラウドは **今回スコープ外**（scope-document Out準拠）。

---

## 非機能要件 (Non-Functional Requirements)

> 品質ゲートの定量基準（P-02確定）。これらは雛形が生成するアプリが満たすべき基準であり、CIで自動検証される。

### NFR-1: 品質（信頼性）— 最優先
- **NFR-1.1 テスト（対象を明示）:**
  - (B)生成されるアプリ: ラインカバレッジ **≥80%**（team-practices準拠）、全テスト緑。happy path＋最低2つのエラー/エッジケースを各機能でカバー。
  - (A)雛形ツール自体: コアロジック（意図解析・ゲートオーケストレーション）のラインカバレッジ **≥80%**。最低限、各コンポーネントにhappy-pathテスト1件。
- **NFR-1.2 静的解析:** Lintエラー **0**、型エラー **0**、フォーマット準拠 **100%**（両層に適用）。
- **NFR-1.3 デプロイ:** CI通過後にAWSへ実デプロイが成功し、ヘルスチェック（FR-4.2: HTTP 200 / 5秒以内）が通る。

### NFR-2: セキュリティ
- **NFR-2.1** 依存脆弱性 **High/Critical = 0**、検出シークレット **= 0**、SASTのHigh指摘 **= 0**。
- **NFR-2.2** 入力は境界で検証・サニタイズする。
- **NFR-2.3** 認証/認可をバイパスするコードを禁止（project.md Forbidden準拠）。シークレットのハードコード禁止。

### NFR-3: 速度（開発リードタイム）— 暫定定量値あり
- **NFR-3.1 (暫定値)** walking skeletonの「意図→生成→4本柱ゲート→AWSデプロイ」が**1回転 ≤ 15分**（人間の介入待ち時間を除くツール実行時間）。これは仮の上限であり、**最終値は performance-validation で確定**する。
- **NFR-3.2 (暫定値)** 品質ゲート（自動修正を除く1回の評価）の実行は **≤ 5分**を目標とし、開発体験を阻害しない。最終値は performance-validation で確定。
- **NFR-3.3** AI自動修正1試行（修正＋全柱再評価）の時間上限も performance-validation で定義する。

### NFR-4: 保守性・再現性
- **NFR-4.1** 同じ意図から同等構成のアプリが再現的に生成される（人/セッション依存を低減）。
- **NFR-4.2** 生成コードは可読で、人が後から手を入れられる一貫アーキテクチャを持つ。

### NFR-5: ユーザビリティ/アクセシビリティ
- **NFR-5.1** 生成される参照アプリは見出し階層・ランドマーク・キーボード操作・色非依存の状態表現を満たす（rough-mockups a11y note準拠）。

### NFR-6: 運用性（横展開の土台）
- **NFR-6.1** 個人が単独で使い始められ、将来チーム共有可能なドキュメント・規約を備える。

---

## トレーサビリティ

| 要件群 | Must/Should | walking skeleton | トレース元 |
|--------|-------------|------------------|-----------|
| FR-1 (AI生成フロー) | Must | 含む | intent(中核体験), scope D-07, intent-backlog B-2, user-flow |
| FR-2 (品質ゲート) | Must | 含む | scope D-08(fail-closed), project.md Mandated/Forbidden, B-3〜B-7, TC-4/RC-1 |
| FR-3 (starter) | Must | 含む | scope In, intent-backlog B-1 |
| FR-4 (AWSデプロイ) | Must | 含む | intent-backlog B-6, TC-3 |
| FR-5 (参照アプリCRUD) | Must(薄い縦切り1リソース) | 含む(ログインはスタブ) | intent-backlog B-9相当を最小化, wireframes |
| FR-6 (CLI/setup) | Must | 含む | user-flow フロー0, rough-mockups |
| FR-7 (スコープ境界) | — (除外明文) | 除外 | scope Out, intent-backlog B-8/Won't, Q5 |
| NFR-1,2 | Must | 含む | scope D-08, project.md Mandated/Forbidden |
| NFR-3〜6 | Must/Should | 一部含む | intent KPI(速度/採用), team-practices |

> 孤児・スコープクリープ対策: FR-5は walking skeleton 内だが「1リソースの薄い縦切り＋ログインスタブ」に限定し、本格認証(B-8)はFR-7.1で明示除外。各FRのMust/Should区分とskeleton包含を上表で固定した。

## 未確定（後続で確定）
- 各NFR目標の最終値（特にNFR-3速度） → performance-validation / nfr-requirements
- 具体フレームワーク/AWSサービス → application-design / infrastructure-design
