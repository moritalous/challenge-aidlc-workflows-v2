# Team Assessment — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Lead: aidlc-delivery-agent
> Upstream: `scope-document.md`, `intent-backlog.md`, `feasibility-assessment.md`

## チームモデル: 人間オーケストレーター + AIエージェントmob

`scope-document.md`（提供形態=組合せ、完全AI生成前提）と intent の「一次利用者=個人」を踏まえ、本イニシアチブのチームは従来の人的チームではなく **「1人の人間（オーナー兼開発者）＋AIエージェント群」** とする。

- **人間（1名）の役割:** 意図の定義、承認ゲートでの意思決定、最終品質判断、方向付け。
- **AIエージェント群の役割:** AI-DLCの11ロール（product/design/delivery/architect/aws-platform/compliance/devsecops/developer/quality/pipeline-deploy/operations）＋コード生成AIが、設計・生成・検証・デプロイを分担実行。

## キャパシティ評価

- 人的キャパは個人主体で限定的。**だからこそ完全AI生成で人手を最小化する**という本イニシアチブの狙いと整合（feasibility-assessment.md の「生成ばらつきをfail-closedゲートで吸収」前提）。
- ボトルネックは人間の「承認・判断」帯域。よって品質ゲートを自動化し、人間の介入を要所（承認ゲート）に集約する設計が重要。

## 適合性（intent-backlog の作業量に対して）

- Must群（B-1〜B-7 = walking skeleton）はAIエージェントmobで実装可能。最不確実なB-2（AI生成フロー）/B-7（fail-closed統合）に人間の監督を厚く配分する。
- 競合イニシアチブによる人材奪い合いは無し（個人主体）。

## リスク（チーム観点）

| リスク | 緩和 |
|--------|------|
| 人間の承認帯域がボトルネック化 | ゲートを自動化し人間判断を要所に集約 |
| AIロール間の引き継ぎロス | オーケストレーター（AI-DLC）が一元調整、エージェント間直接委譲を禁止 |
| スキルギャップ（特定領域でAIの精度不足） | 品質ゲートで検出し、人間レビューにエスカレーション |

<!-- Text fallback: チームは人間1名+AI 11ロール。人間は意図定義と承認、AIが設計生成検証デプロイを分担。ボトルネックは人間承認帯域でありゲート自動化で緩和。 -->
