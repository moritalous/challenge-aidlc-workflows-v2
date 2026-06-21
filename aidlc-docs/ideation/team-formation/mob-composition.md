# Mob Composition & RACI — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Upstream: `team-assessment.md`, `skill-matrix.md`

## Mob構成（walking skeleton = B-1〜B-7）

人間オーケストレーター1名を中心に、AIエージェントが各 proto-Unit を担当する mob を組む。AI-DLCオーケストレーターが全調整を行い、エージェント間の直接委譲は禁止。

```
            +---------------------------+
            |   人間オーケストレーター   |  意図定義 / 承認 / 最終判断
            +-------------+-------------+
                          |
            +-------------v-------------+
            |   AI-DLC オーケストレーター |  全調整・ステージ進行
            +-------------+-------------+
                          |
  +----------+----------+----------+----------+----------+
  |          |          |          |          |          |
architect developer  quality  devsecops aws-platform pipeline-deploy
 (設計)   (生成)    (テスト) (セキュリティ) (AWS)      (CI/デプロイ)
```
<!-- Text fallback: 人間オーケストレーターの下にAI-DLCオーケストレーター、その下にarchitect/developer/quality/devsecops/aws-platform/pipeline-deployの各AIロールがwalking skeletonを分担。 -->

## RACI（walking skeleton 主要アクティビティ）

| アクティビティ | Responsible | Accountable | Consulted | Informed |
|----------------|-------------|-------------|-----------|----------|
| 意図定義・スコープ | product-agent | 人間 | architect | delivery |
| アーキ設計/AI生成フロー | architect-agent | 人間 | aws-platform, developer | quality |
| コード生成 | developer-agent | 人間(承認) | architect | quality |
| テストゲート | quality-agent | 人間 | developer | — |
| 静的解析・型ゲート | developer-agent | 人間 | quality | — |
| セキュリティゲート | devsecops-agent | 人間 | compliance | — |
| AWSデプロイ/IaC | aws-platform-agent | 人間 | pipeline-deploy | operations |
| CI fail-closed統合 | pipeline-deploy-agent | 人間 | quality, devsecops | — |

> Accountable は常に人間（承認ゲートの意思決定者）。AIロールは Responsible（実行責任）。

## オンボーディング/キャパシティ合意

- 人間は各ステージの承認ゲートで関与（intent-backlog の Must群を最優先）。
- AIロールはオーケストレーター経由でのみ起動。並列実行はConstruction（Bolt/swarm）で活用。
- 外部パートナーは現段階で不要（将来の横展開で検討）。
