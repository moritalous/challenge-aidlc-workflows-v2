# User Stories — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Lead: aidlc-product-agent / Support: aidlc-design-agent
> Upstream: `requirements.md`(FR/NFR), `personas.md`, `team-practices.md`
> 形式: INVEST準拠。受け入れ条件は BDD(Given/When/Then)。各ストーリーは Must/Should と walking skeleton 包含を明示。

## Epic A: AI生成ワークフロー（中核体験）

### US-A1 意図入力と要約確認【Must / skeleton / FR-1.1, FR-1.2】
**As** 個人開発者タクミ **I want** 作りたいアプリを自然言語で伝えると要約を提示してほしい **so that** 生成前に認識のズレを正せる。
- AC1: Given 意図文を入力 When 解析完了 Then エンティティ・画面・主要操作の要約が表示される
- AC2: Given 要約が表示 When 「編集」を選ぶ Then 修正内容で再解析され、承認するまで繰り返せる
- AC3: Given 要約が表示 When 「承認」を選ぶ Then 生成ステップに進む
- **値:** 手戻り削減（リードタイム短縮）。 **Size:** M。 **Independent:** 生成の前段として単独テスト可。

### US-A2 コード生成【Must / skeleton / FR-1.3, FR-1.4】
**As** タクミ **I want** 承認した意図からTSフルスタックのコードを生成してほしい **so that** ゼロから書かずに済む。
- AC1: Given 意図が承認済み When 生成実行 Then フロント/API/DBの各層に対応するファイルが生成され、**生成物がビルド（型チェック含む）を型エラー0で通過する**（NFR-1.2準拠）
- AC2: Given 生成完了 When 成果物を確認 Then 各生成物が意図のどの項目に対応するか追跡できる（対応表が出力される）
- AC3: Given 意図に必須情報（エンティティ等）が欠落 When 生成 Then 不足を検出してUS-A1の要約確認へ差し戻す
- **値:** ゼロ実装の削減。 **Size:** L（理由: フロント/API/DBの縦スライスで見積可能。Functional Designで層ごとのコンポーネントに分割予定）。 **依存:** US-A1。

## Epic B: 品質ゲート（4本柱・fail-closed）

### US-B1 4本柱ゲートの自動実行【Must / skeleton / FR-2.1, FR-2.2】
**As** タクミ **I want** 生成後に4本柱（テスト/静的解析・型/セキュリティ/デプロイ可能性）が自動で検証されてほしい **so that** 品質を自分でチェックせずに担保できる。
- AC1: Given コード生成完了 When ゲート起動 Then 4柱すべてが評価され、各柱の合否結果が記録・出力される（評価順序は問わない）
- AC2: Given いずれか不合格 When 評価完了 Then 後続（デプロイ/マージ）に進めず停止し、不合格項目と該当箇所を提示する
- AC3: Given 全柱合格 When 評価完了 Then 次（デプロイ）へ進む
- **値:** 品質の自動担保（中核テーゼ）。 **Size:** L（理由: 4柱の評価＋停止判定で見積可能。Functional Designで柱ごと=テスト/静的解析/セキュリティ/デプロイの検証単位に分割予定）。

### US-B2 AI自動修正ループ【Must / skeleton / FR-2.3】
**As** タクミ **I want** ゲート不合格時にAIが自動修正を試みてほしい **so that** 些細な不合格で手を止めずに済む。
- AC1: Given ゲート不合格 When 自動修正有効 Then 「修正→全4柱再評価」を最大3試行繰り返す
- AC2: Given ある試行で全柱合格 When 評価 Then 修正ループを終え次へ進む
- AC3: Given 部分合格（一部の柱のみ改善） When 再評価 Then 不合格として次試行へ進む
- **Size:** L。 **依存:** US-B1。

### US-B3 失敗エスカレーション【Must / skeleton / FR-2.4】
**As** タクミ **I want** 自動修正が尽きたら選択肢を提示してほしい **so that** 行き詰まりを自分で打開できる。
- AC1: Given 3試行で全柱合格に至らない When 失敗確定 Then [意図修正再実行 / 手動修正再投入 / 中断] の3択を提示する
- AC2: Given 「中断」を選択 When 実行 Then 生成物を保存し後で再開できる
- **Size:** M。 **依存:** US-B2。

## Epic C: スターター & デプロイ

### US-C1 品質ガードレール内蔵のstarter【Must / skeleton / FR-3.1, FR-3.2】
**As** タクミ **I want** 生成された雛形に最初からLint/型/テスト/セキュリティ/CI設定が入っていてほしい **so that** 設定作業をしなくてよい。
- AC1: Given 雛形適用 When 検査 Then 6種(Lint/型/フォーマット/テスト/セキュリティ/CI)の設定が存在する
- AC2: Given 適用先が空でない/競合 When 適用 Then 上書きせず競合を検出して中断し競合ファイルを提示する
- **Size:** M。

### US-C2 AWSデプロイ【Must / skeleton / FR-4.1〜4.4】
**As** タクミ **I want** ゲート全通過後に自動でAWSへデプロイしてほしい **so that** すぐ公開URLで動作確認できる。
- AC1: Given 4柱全通過 When デプロイ Then AWSへデプロイされ公開URLが提示される
- AC2: Given デプロイ完了 When ヘルスチェック Then HTTP200を5秒以内に返す
- AC3: Given デプロイ失敗 When デプロイ柱評価 Then 不合格として停止し失敗理由とロールバック方針を提示する（FR-4.3）
- AC4: Given デプロイ途中で失敗 When 中断 Then 部分作成リソースをロールバックする、またはロールバック手順を明示提示する（FR-4.4, operation phaseルール）
- **値:** 本番到達。 **Size:** L（理由: デプロイ＋ヘルスチェック＋失敗ロールバックの縦スライスで見積可能。Functional/Infra Designで詳細化）。 **依存:** US-B1。

### US-C3 参照CRUDアプリ生成【Must / skeleton / FR-5.1〜5.4】
**As** タクミ **I want** 雛形が動く参照CRUDアプリを生成してほしい **so that** 生成される「型」を確認できる。
- AC1: Given 雛形 When 生成 Then 1リソースの一覧/詳細編集/作成と、シードユーザー前提のログインスタブが生成される
- AC2: Given 詳細画面 When 削除 Then 確認ダイアログを挟み、キャンセル時は変更しない
- AC3: Given 保存 When 実行 Then 成功/失敗をテキスト通知し、失敗時は入力値を保持する
- AC4: Given ログインスタブ When 不正な資格情報 Then エラーを入力欄近傍に表示し再入力を促す
- **Size:** M。

## Epic D: CLI/セットアップ体験

### US-D1 初回セットアップ & 再開始【Must / skeleton / FR-6.1, FR-6.2, FR-6.3】
**As** タクミ **I want** 初回にAWS認証とプロジェクト設定をガイドし、2回目以降は素早く始めたい **so that** つまずかず、かつ再利用時は速い。
- AC1: Given 初回 When インストール Then AWS認証情報の確認＋セットアップ(リージョン/プロジェクト名)を行う
- AC2: Given 認証情報が欠落/無効 When セットアップ Then 検出して停止し設定方法を案内、生成/デプロイには進まない
- AC3: Given 2回目以降（セットアップ済み） When 起動 Then セットアップを飛ばし意図入力から直接開始する（FR-6.3）
- **Size:** M。

### US-D2 ゲート結果の可視化【Must / skeleton / FR-6.4, NFR-5.1】
**As** タクミ **I want** 各柱の合否が一目で分かってほしい **so that** どこで止まったか即座に把握できる。
- AC1: Given ゲート実行中 When 結果表示 Then 各柱の合否を記号＋テキストで示す（色のみに依存しない）
- AC2: Given ゲート実行が途中 When 未完了の柱を表示 Then 未実行/実行中を「保留(記号＋テキスト)」として示し、誤って合格と見せない
- AC3: Given ゲートが異常終了/タイムアウト Then 該当柱を「エラー(理由付き)」として表示し、合否未確定を明示する
- **Size:** S。

## ペルソナとストーリーの対応（誰のストーリーを書くか）

- **P1 個人開発者タクミ:** 全ストーリーの主アクター。今回の人間利用者。
- **P2 チームリード ミサキ:** 今回スコープではストーリー化しない（横展開フェーズの対象）。成功指標（採用・再利用数）の前提として考慮するのみ。
- **P3 AIエージェント（生成主体）:** 非人間アクター。ストーリーの「As」には立てない（要件側で「P3が従いやすい明確な合格基準」として満たす）。US-A2/US-B群はP3が従う対象として設計されている。

## スコープ外（ストーリー化しない／FR-7）

- 本格認証（サインアップ/IdP統合/パスワードリセット）= B-8(Should, 将来Bolt)
- 多アプリ形態の一般化、組織配布基盤、非エンジニア向けUI、マルチクラウド
- P2向けのチーム配布・オンボーディング機能（横展開フェーズ）

## 依存・順序（critical path）

```
US-D1 -> US-A1 -> US-A2 -> US-B1 -> US-B2 -> US-B3
                                 \-> US-C2 (デプロイ柱)
US-C1 (starter) は US-A2 と並行可 / US-C3 は US-A2 後 / US-D2 は US-B1 後
```
<!-- Text fallback: 初回セットアップ→意図入力→生成→ゲート(→自動修正→エスカレーション)。starterは生成と並行、参照アプリは生成後、デプロイはゲート後、可視化はゲート後。 -->
