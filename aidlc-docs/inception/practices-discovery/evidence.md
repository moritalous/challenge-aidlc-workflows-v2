# Evidence — Practices Discovery

> Greenfield: コード証拠スキャン(Step2)はスキップ。org既定を提案値としたインタビュー(Step3)に基づく。

## Way of Working
- Scanned: なし(greenfield)。Inferred: org既定(trunk-based/squash)。Asked: 採用可否 → org既定を採用。

## Walking Skeleton
- Inferred: org既定(greenfield feature = on)。Asked: → 採用(on)。

## Testing Posture
- Inferred: org既定(80%カバレッジ/CIゲート)。Asked: → 採用。

## Deployment
- Inferred: org既定(merge→staging自動 / 本番手動承認)。Asked: → 採用。

## Code Style
- Inferred: TSデフォルト(Prettier/ESLint)。Asked: → 採用。

## Project-specific
- Asked: 品質ゲートの扱い → 4本柱fail-closedを必須ルール化(Mandated/Forbiddenへ)。
