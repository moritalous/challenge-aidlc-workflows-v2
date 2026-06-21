# Quality Gates — Walking Skeleton

> Status: Draft (awaiting approval gate)
> fail-closed の4本柱（project Mandated / BR-T1 / ADR-005）をCIに具現化。

## ゲート合成（fail-closed AND）
```
quality-gate = AND(test, static, security, deploy-validate)
→ いずれか1つでもFAIL/未完了(PENDING/ERROR)ならゲート閉=マージ/デプロイ不可
```
- `quality-gate` ジョブは4柱を `needs` で待ち、全PASS時のみ成功。
- `deploy-staging` は `needs: [quality-gate]` のため、ゲート通過なしにデプロイ不可（fail-closed を配線で保証）。

## 各柱の合格条件
| 柱 | 合格条件 | 典拠 |
|----|----------|------|
| test | 全テスト緑＋カバレッジ ≥80%（両層） | NFR-1.1 / team practice |
| static | tsエラー0・Lint0・フォーマット準拠 | NFR-1.2 |
| security | 本番依存 High/Critical=0・シークレット=0・Trivy High/Critical=0・Semgrep High=0 | NFR-2.1 / project Mandated |
| deploy-validate | build成功＋`cdk synth`成功 | NFR-1.3 |

## Branch Protection（required status checks）
main に対し以下を必須化（PENDING/ERROR=非PASSとして扱われ、未完了チェックはマージ不可）:
- `Pillar - Tests`
- `Pillar - Static & Types`
- `Pillar - Security`
- `Pillar - Deployability`
- `Quality Gate (fail-closed AND)`

加えて: 「Require status checks to pass before merging」「Require branches to be up to date」を有効化。squash-merge を既定（team WoW）。

## PENDING/ERROR の扱い
- GitHub の required checks は「成功」以外（未報告/失敗/エラー）をマージ不可として扱う → US-D2 AC2/AC3（保留・エラーを合格と見せない）を満たす。

## 本番ゲート
- staging は deploy-on-merge（自動）。本番は GitHub Environment の手動承認（tech lead + product owner 相当）を別途設定（org/team rule）。
