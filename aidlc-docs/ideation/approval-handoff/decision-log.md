# Decision Log — Ideation Phase

> Status: Draft (awaiting approval gate)
> Ideationフェーズで確定した主要意思決定の記録（トレーサビリティ用）

| # | 決定 | 値 | 出所/根拠 | 確定ステージ |
|---|------|----|-----------|--------------|
| D-01 | スコープ | feature（Standard深度、全フェーズ） | ユーザー選択 | scope確認 |
| D-02 | 生成物の到達点 | 本番運用まで | intent F1 | intent-capture |
| D-03 | 一次利用者 | 個人エンジニア→将来チーム横展開 | intent Q2/F2 | intent-capture |
| D-04 | 主要KPI | 採用・再利用数 | intent Q5 | intent-capture |
| D-05 | 「雛形」の定義 | コードtemplate＋品質ガードレールを含む総合的な型 | project-learning(c1) | intent-capture |
| D-06 | 提供形態 | 組合せ（starter repo＋品質ゲート＋AI生成ワークフロー） | scope Q1=D | scope-definition |
| D-07 | walking skeleton範囲 | 意図→生成→4本柱ゲート→AWSデプロイが1回転 | scope Q2=C | scope-definition |
| D-08 | 品質ゲート初期スコープ | 4本柱すべてfail-closed必須 | scope Q3=A | scope-definition |
| D-09 | シーケンス方針 | リスクファースト | scope Q4=A | scope-definition |
| D-10 | 技術スタック方針 | モダンTSフルスタック＋本番AWS（サーバレス志向） | intent Q7 | intent-capture（実装はinfra-designで確定） |
| D-11 | 実現性判定 | HIGH / Go | feasibility-assessment | feasibility |
| D-12 | チームモデル | 人間オーケストレーター＋AIエージェントmob | team-assessment | team-formation |
| D-13 | 認証スコープ | skeletonはシードユーザー前提、本格認証はB-8(Should) | rough-mockups | rough-mockups |

## 先送り決定（後続ステージで確定）

| # | 事項 | 確定先 |
|---|------|--------|
| P-01 | 提供形態の実装方式 | application-design |
| P-02 | 品質ゲート定量基準 | requirements-analysis / nfr-requirements |
| P-03 | AWS具体構成 | infrastructure-design |
| P-04 | 認証本格化・CLIセットアップ失敗パス | user-stories / refined-mockups |

## フェーズ境界トレーサビリティ確認

- 全 Ideation 成果物が存在し、相互参照（upstream-coverage）を満たす。
- intent → market → feasibility → scope → team → mockups → handoff の連鎖が途切れていない。
- 未解決の矛盾なし。先送り事項はすべて確定先ステージが明確。
