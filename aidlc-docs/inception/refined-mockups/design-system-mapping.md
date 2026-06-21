# Design System Mapping — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> デザイントーン未指定→ミニマル既定。横展開時にテーマ差し替え可能な設計（トークン化）。

## デザイントークン（既定値・暫定）

| トークン | 用途 | 既定値(暫定) |
|----------|------|--------------|
| color.bg | 背景 | 中立(白/ダーク両対応) |
| color.fg | テキスト | 高コントラスト(AA: 4.5:1以上) |
| color.primary | 主要アクション | 中立アクセント |
| color.danger | 破壊的/エラー | 赤系（ただし色のみに依存しない） |
| font.base | 本文 | システムフォント |
| font.mono | コード/CLI | 等幅 |
| space.unit | 余白基準 | 4px グリッド |
| radius | 角丸 | 控えめ |

> 具体フレームワークのUIライブラリ（例: 既製コンポーネント集）採用可否は application-design で決定。本マッピングは「トークンを介して差し替え可能」という方針を固定するもの。
>
> **application-designへの宿題:** `color.primary`(中立アクセント)・`color.danger`(赤系)の具体値はWCAG AA（本文4.5:1）に適合するか未検証（暫定）。確定時にコントラスト比を検証し、不足なら値を調整する。

## コンポーネント対応（参照アプリ）

| UI要素 | コンポーネント | 状態 |
|--------|----------------|------|
| ボタン | Button(primary/secondary/danger) | default/hover/focus/disabled |
| 入力 | TextField(label, error, helper) | default/focus/error |
| ラジオ | RadioGroup(Status) | selected/focus |
| リスト行 | ListItem(checkbox, title, meta, link) | default/hover/focus |
| ダイアログ | ConfirmDialog | open(focus trap)/close |
| 通知 | StatusBanner / AlertBanner | status(polite)/alert(assertive) |
| 空状態 | EmptyState(message, CTA) | — |

## CLI 表示規約

| 要素 | 規約 |
|------|------|
| ゲート行 | `[記号] N. 名称  STATUS  詳細` の固定フォーマット |
| 記号 | [x]PASS [!]FAIL [~]PENDING [ ]未実行 [E]ERROR（色は補助のみ） |
| 区切り | ASCII（Unicode罫線は不使用, stage-protocol準拠） |

## 再利用性（横展開の土台）
- 全色・余白・フォントはトークン経由。テーマ差し替えでチーム/組織ブランドに適合可能（intent KPI=採用の土台）。
