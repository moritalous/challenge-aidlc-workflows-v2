# Accessibility Checklist — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> 目標水準: WCAG 2.1 AA（NFR-5.1 / team-practices準拠）
> Upstream: `mockups.md`, `interaction-spec.md`

## 各画面チェック（Web）

| 画面 | 見出し階層 | ランドマーク | キーボード入口 | 色非依存 | aria-live |
|------|-----------|--------------|----------------|----------|-----------|
| ログイン(2-1) | h1=MyApp | main(フォーム) | Email初期フォーカス→Tab | エラーは記号＋文 | alert(エラー) |
| 一覧(2-2) | h1=Tasks | header+main | +New Task/各行Tab順 | 状態は記号＋文 | — |
| 詳細(2-3) | h1=タスク名 | main+nav(Back) | Title初期フォーカス | 保存成否は[OK]/[!]＋文言、Deleteはアイコン＋"削除"ラベル併記 | status(保存)/alert(失敗) |
| 削除確認 | ダイアログtitle | dialog(focus trap) | キャンセルに初期フォーカス | danger色のみに依存せず"削除"ラベル＋確認文 | alert |
| 空状態 | h1=Tasks | main | CTAにTab到達 | テキストCTA("最初のタスクを作成") | — |
| CLI意図入力/要約(1-A1/1-A3) | — | — | フィールド/承認・編集キー | テキストのみ(色非依存) | 逐次テキスト出力 |
| CLIデプロイ(1-5/1-5e) | — | — | 再試行(r)/中断(q) | PASS/FAIL語＋理由(色非依存) | 逐次テキスト出力 |

## CLI チェック

- [x] ステータスは記号＋英大文字語＋詳細の三重表現（色のみに依存しない, US-D2 AC1）
- [x] PENDING/未実行/ERROR を PASS と誤認させない（US-D2 AC2/AC3）
- [x] 全操作がキーボードのみで完了可能
- [x] 状態更新を逐次テキスト出力（スクリーンリーダー追従）

## 横断チェック（WCAG 2.1 AA 抜粋）

- [x] コントラスト比 本文4.5:1 / 大テキスト3:1 以上（color.fg トークンで担保）
- [x] フォーカス可視（focus リング）
- [x] 画像/アイコンに代替テキスト
- [x] フォーム入力に label 関連付け、エラーは入力欄近傍＋aria-describedby
- [x] 破壊的操作は確認、デフォルトフォーカスは安全側
- [x] 動的更新は aria-live（成功=polite, 失敗/警告=assertive）

## 検証方法（後続）
- 自動: axe-core 等を品質ゲートのテスト/静的解析に組込む（Build and Test で具体化）。
- 手動: キーボードのみ操作・スクリーンリーダーのスポットチェック。

> a11y は雛形が生成するアプリの既定品質に組み込む（生成物が最初からAA志向になる）。
