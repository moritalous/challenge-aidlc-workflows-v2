# Feasibility — Questions

> Mode: Desk assessment（ユーザー指示で対話Q&Aを省略。intent-statement.md ＋ market-research ＋ architect/aws-platform/compliance視点で回答）

## Q1. 統合が必要な既存システムは？
[Answer]: 新規（グリーンフィールド）。既存システム統合は無い。雛形は外部の成熟コンポーネント（AIモデルAPI、CI、スキャナ、AWS）と連携するが、レガシー統合制約は無し。

## Q2. 規制・コンプライアンス要件は？
[Answer]: 本イニシアチブ固有の強い規制（PCI/HIPAA等）は現時点で未指定。ただし雛形の品質ガードレールとして OSSライセンス管理・シークレット検出・依存脆弱性対応・入力検証 を標準で内蔵する（compliance視点）。データレジデンシは将来要件として保留。

## Q3. チームの現行スタックとスキルは？
[Answer]: TypeScriptフルスタックを志向（intent Q7）。AI生成前提のため、利用者のスキル依存を下げる設計が目標。

## Q4. 予算・スケジュール制約は？
[Answer]: 明示的制約は未指定。市場スピードがトリガーのため、早期に動く雛形（walking skeleton）を出す方針。コストはサーバレス従量で初期最小化（aws-platform視点）。

## Q5. 組織的ブロッカーは？
[Answer]: 個人/少人数主体のため組織的ブロッカーは小。将来の横展開時にガバナンス要件が増える想定。

## Q6. 現在利用中のAWSサービス・アカウントは？
[Answer]: 未指定。新規前提でサーバレス中心の構成を既定とする（Lambda/API Gateway/マネージドDB/S3+CloudFront/Cognito/IaCはCDKまたはSAM）。最終確定は infrastructure-design。
