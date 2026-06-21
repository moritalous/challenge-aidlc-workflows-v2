# Frontend Components — Walking Skeleton (Generated App)

> Status: Draft (awaiting approval gate)
> Stack: React + Vite (ADR-002) ／ a11y: WCAG 2.1 AA (NFR-5.1)
> Upstream: `refined-mockups/mockups.md`, `interaction-spec.md`, `design-system-mapping.md`

生成アプリ（参照CRUD）のフロントエンドコンポーネント。skeletonは薄い1リソース。

## コンポーネント一覧

| コンポーネント | 役割 | 状態 | a11y |
|----------------|------|------|------|
| `LoginPage` | シードユーザーログイン(スタブ) | idle/submitting/error | h1=アプリ名, main, Email初期focus, error=aria-live=alert |
| `TaskListPage` | タスク一覧 | loading(skeleton)/loaded/empty | h1="Tasks", header+main, +New Task→Tab順, 状態=記号+文 |
| `TaskDetailPage` | 詳細/編集 | viewing/editing/saving/error | h1=タスク名, main+nav(Back), Title初期focus, status/alert(aria-live) |
| `ConfirmDialog` | 削除確認 | open/closed | role=dialog, focus trap, 初期focus=キャンセル(安全側) |
| `StatusBanner` | 保存成功通知 | visible/hidden | role=status, aria-live=polite |
| `AlertBanner` | 失敗/エラー通知 | visible/hidden | role=alert, aria-live=assertive |
| `EmptyState` | 空状態CTA | — | テキストCTA("最初のタスクを作成") |

## 状態遷移（TaskDetailPage 保存）
```
[editing] --Save--> [saving] --成功--> [StatusBanner: 保存しました] --> 一覧へ
                          \--失敗--> [AlertBanner + 入力値保持] --> [editing]
```
<!-- Text fallback: 詳細保存は editing→saving→(成功:StatusBanner→一覧 / 失敗:AlertBanner・入力保持→editing)。 -->

## デザイントークン（design-system-mapping準拠）
- 色はトークン経由（color.fg は AA 4.5:1 担保）。color.primary/danger の AA 適合は実装時に検証（refined-mockupsの宿題）。
- 状態は色のみに依存せず記号/ラベル併記。

## 入力検証（クライアント側、サーバ検証と二重）
- title 必須・1〜200文字。dueDate 形式チェック。エラーは入力欄近傍に aria-describedby で提示。

## トレーサビリティ
| US/FR | コンポーネント |
|-------|----------------|
| US-C3 AC1 | TaskListPage, TaskDetailPage, LoginPage |
| US-C3 AC2/FR-5.2 | ConfirmDialog |
| US-C3 AC3/FR-5.3 | StatusBanner, AlertBanner |
| US-C3 AC4/FR-5.4 | LoginPage(error) |
| NFR-5.1 | 全コンポーネントのa11y注記 |
