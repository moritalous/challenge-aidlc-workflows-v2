# Market Research — Questions

> Mode: Desk research（ユーザー指示により対話Q&Aを省略。intent-statement.md ＋ アナリスト評価で回答）
> 出典の扱い: 個別URLの厳密な引用ではなくアナリスト評価。確証のない主張は assumption と明示。

## Q1. 競合する製品・ソリューションは何か？
[Answer]: 大きく3層。①AIアプリビルダー／バイブコーディング（bolt.new, v0, Lovable, Replit Agent, Cursor, GitHub Copilot Workspace, Devin, Claude Code 等）②スキャフォールド／スターター（create-t3-app, create-next-app, AWS Amplify Gen2, Vercel Templates, Nx, Yeoman 等）③品質ガードレール層（CI/CD, Lint/型, テストフレームワーク, SAST/シークレットスキャン — 単体ツール群）。詳細は competitive-analysis.md。

## Q2. それぞれの強み・弱み・価格モデルは？
[Answer]: バイブ系は「速度・体験」が強みだが「本番品質ガードレールの内蔵」が弱い傾向（assumption）。スターター系は構造の再現性が強みだがAI生成・品質ゲート統合は薄い。価格はSaaSサブスク（無料枠＋従量/席課金）が主流。詳細は competitive-analysis.md。

## Q3. 関連する業界トレンド・規制シフトは？
[Answer]: エージェント型コーディングの台頭、「バイブコーディング」概念の一般化、AI生成コードの品質・セキュリティ懸念の高まり、シフトレフト品質、エンタープライズ採用に伴うガードレール要求。詳細は market-trends.md。

## Q4. 顧客が当然視するもの（table-stakes）vs 差別化要因は？
[Answer]: Table-stakes＝高速なコード生成・動くプレビュー・モダンスタック。差別化＝「完全AI生成でも本番品質を自動担保する仕組み（テスト/型/Lint/セキュリティ/CI/デプロイ）」を型として統合している点。詳細は competitive-analysis.md / build-vs-buy.md。

## Q5. build-vs-buy-vs-partner の判断は？
[Answer]: 既製を buy/組合せ（AIモデル、CIプラットフォーム、スキャナ、テストランナー、AWSデプロイ）。自前で build するのは「それらを束ねる雛形＋品質ガードレールのオーケストレーション（AIが従いやすい型・合格基準）」。詳細は build-vs-buy.md。

## Q6. 市場規模・対象オーディエンスは？
[Answer]: 一次は個人エンジニア／少人数（→将来チーム横展開）。AI開発ツール市場は急拡大中（assumption: 公開市場レポート水準の定量値は本ステージでは未確定、scope/feasibilityで必要なら精査）。
