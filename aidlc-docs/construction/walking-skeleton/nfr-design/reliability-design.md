# Reliability Design — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `nfr-requirements/reliability-requirements.md`, `business-rules.md`(BR-T1/T1'/T6)

## (A) 雛形ツールの信頼性設計

| 要件 | 設計 |
|------|------|
| REL-T1（fail-closed） | `evaluate()` は `results.length===4 && every(PASS)` のみ合格。非PASSは絶対にDeployへ進めない。順序非依存のAND合成 |
| REL-T2（再現性） | 意図→生成は決定的プロンプト＋固定テンプレート。Provider差し替え時も `IntentModel` 契約を不変に保つ |
| REL-T3（冪等デプロイ） | CDK `deploy` は同一スタックへの差分適用。失敗時は CloudFormation 自動ロールバック、手順を `details` に提示 |
| REL-T4（境界堅牢性） | AI/AWS/DB 呼び出しは `Result<T,E>` で包み、例外は捕捉し構造化エラーへ。沈黙の失敗禁止 |
| REL-T5（安全停止 BR-T1'） | 非PASS時は `HaltForHuman`：1回停止し不合格柱と理由を提示。進捗（生成物）は破棄しない |

```ts
// fail-closed の中核（順序非依存・PENDING/ERROR=非PASS）
function evaluate(results: GateResult[]): { passed: boolean; next: "Deploying" | "HaltForHuman" } {
  const passed = results.length === 4 && results.every((r) => r.status === "PASS");
  return { passed, next: passed ? "Deploying" : "HaltForHuman" };
}
```
- skeletonは自動修正(U6)を含まない。`HaltForHuman` 後の再投入は人手→ユーザー再起動（BR-T1'）。U6のAutoFix/Escalationは後続Boltで `next:"AutoFix"` に差し替え。

## (B) 生成アプリの信頼性設計

| 要件 | 設計 |
|------|------|
| REL-A1（SLO 99.9%/30日） | サーバーレス構成のマネージド可用性に依拠。アラート閾値（例: 99.9%割れ前に5分エラー率>1%で通知）は observability-setup で実装 |
| REL-A2（ヘルス HTTP200/5秒） | デプロイ後にスモークテストで `/health` を叩き、非200ならデプロイ柱FAIL |
| REL-A3（障害時UI） | API失敗は構造化エラー→フロントは入力値保持＋AlertBanner（aria-live=assertive） |
| REL-A4（耐久性） | DynamoDB のマネージド多重化に委譲。skeletonで独自バックアップなし |
| REL-A5（デグラデーション） | 一覧取得失敗でも EmptyState/エラー表示でクラッシュ回避 |

## ロールバック / 復旧
- デプロイ失敗: CloudFormation スタックのロールバック。手順は `details` に出力（FR-4.4）。
- アラート閾値はSLO違反（99.9%/30日）より手前に置く（operation phase ルール準拠、observability-setup で具体化）。
