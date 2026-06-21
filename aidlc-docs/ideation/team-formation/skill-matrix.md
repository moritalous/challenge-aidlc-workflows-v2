# Skill Matrix & Gap Analysis — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Upstream: `team-assessment.md`, `intent-backlog.md`, `scope-document.md`

必要スキルを intent-backlog の proto-Unit から導出し、担い手（AIロール/人間）とギャップを示す。

| 必要スキル | 関連 proto-Unit | 担い手 | カバレッジ | ギャップ/対応 |
|------------|------------------|--------|------------|----------------|
| 要件・スコープ定義 | B全般 | aidlc-product-agent ＋ 人間 | 高 | 人間が意図定義で補完 |
| TSフロントエンド | B-1, B-9 | aidlc-developer-agent | 高 | — |
| TSバックエンド/API | B-1, B-9 | aidlc-developer-agent | 高 | — |
| データモデル/DB | B-1 | aidlc-architect/developer | 高 | — |
| AWSサーバレス/IaC | B-6 | aidlc-aws-platform-agent | 高 | 最終構成はinfra-designで確定 |
| CI/CDパイプライン | B-6, B-7 | aidlc-pipeline-deploy-agent | 高 | fail-closed統合が要 |
| 自動テスト設計 | B-3 | aidlc-quality-agent | 高 | — |
| 静的解析・型・規約 | B-4 | aidlc-developer/quality | 高 | — |
| セキュリティ（脆弱性/SAST/シークレット） | B-5 | aidlc-devsecops-agent | 高 | RC-1/2を標準ゲート化 |
| AI生成ワークフロー設計 | B-2, B-7 | aidlc-architect ＋ 人間 | 中 | **最不確実領域**。人間監督を厚く |
| 観測性 | B-10 | aidlc-operations-agent | 高 | Should-have |
| ドキュメント | B-11 | aidlc-product/developer | 高 | Should-have |

## ギャップ分析サマリ

- **充足:** 標準的なフルスタック開発・AWS・CI・テスト・セキュリティスキルはAIロール群で高カバレッジ。
- **要注意ギャップ:** 「AI生成ワークフロー設計（B-2/B-7）」は前例が少なく不確実性が高い。ここに人間の設計判断と反復を集中させる（リスクファースト方針と一致）。
- **是正計画:** 不確実領域は walking skeleton で早期に実証し、失敗から学習（memory/learnings）して型を固める。
