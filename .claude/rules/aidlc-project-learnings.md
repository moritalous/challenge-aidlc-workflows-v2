# Project-Level Learnings

> Rolling dated entries captured by the §13 learning gate. A separate
> surface from aidlc-project.md proper — never practices-discovery's
> topical sections, never ## Corrections. Each entry is tagged by its
> diary heading (Interpretation / Deviation / Tradeoff). Edit at the
> gate, not directly.

## Learnings
- 2026-06-21 [Decided] 本プロジェクトにおける「雛形」は、コードのスターターテンプレートだけでなく、品質を自動担保するガードレール（自動テスト・Lint・型チェック・セキュリティスキャン・CI）を含む総合的な開発の型を指す。雛形に関する設計判断は常にこの品質ガードレールを前提とする。 <!-- cid:intent-capture:c1 -->
- 2026-06-21 [Decided] 本プロジェクトの要件・設計は2層で記述する: (A)雛形ツール自体の振る舞い と (B)雛形が生成するアプリが満たすべき品質基準。品質目標やテスト基準を述べる際は、どちらの層に対する基準かを常に明示する。 <!-- cid:requirements-analysis:c2 -->
- 2026-06-21 [Decided] 生成アプリの確定スタック: React+Vite(フロント, S3+CloudFront配信) / Hono on AWS Lambda + API Gateway(API) / DynamoDB(DB) / AWS CDK(IaC) / TypeScript統一。品質ゲートツール: Vitest+Playwright / tsc+ESLint+Prettier / npm audit+Trivy+gitleaks+Semgrep / GitHub Actions。AIモデルはCodeGenProviderインターフェースの背後に隔離し差し替え可能とする。 <!-- cid:application-design:c2 -->
- 2026-06-21 [Interpretation] 下流の機能設計・実装は上流契約（U0: IntentModel/GateResult/Project）の列挙値・フィールドを黙って削ってはならない。契約との不一致は契約層で解消する（例: changeStatus は IntentModel.operations に保持し、skeletonでは update(PUT) の単純更新として実現。スコープ外にするのは状態遷移規則・専用UIであって契約の列挙値ではない）。 <!-- cid:functional-design:c1 -->
- 2026-06-21 [Deviation] walking skeleton は U6（自動修正AutoFix/エスカレーション）を含まない。ゲート非PASS時は HaltForHuman（1回停止・不合格理由提示・人手修正前提, BR-T1'）で動く。BR-T2/T3/T7・自動修正ループ・3分岐エスカレーションは後続Bolt(U6)スコープ（典拠=unit-of-work.md L74/L78）。 <!-- cid:functional-design:c2 -->
- 2026-06-21 [Interpretation] application-design で確定済みのスタック決定（ADR-002等）を下流のnfr-requirementsで再決定しない。下流stageは上流確定事項をNFR観点で追認・正当化し、根拠を固定するに留める（二重管理・不一致の防止）。性能の暫定値は performance-validation へ委譲する。 <!-- cid:nfr-requirements:c1 -->
- 2026-06-21 [Tradeoff] モックした外部I/O（DynamoDB等）のユニットテストは緑でも、生成コードのデータアクセス手段（Scan/Query等）とIaCのIAM権限の不整合を検出できない。データアクセス手段は必ず付与IAMアクションと一致させ、不整合は権限を緩めず設計整合な手段（例: list用GSI+Query）で解消する。アーキレビューでこの種の『テストが捕まえない』欠陥を必ず点検する。 <!-- cid:code-generation:c1 -->
- 2026-06-21 [Interpretation] セキュリティ柱のdev依存脆弱性は本番非該当として扱う。カバレッジ/監査はランタイム成果物を基準に判定し、ビルド専用ツールチェーン(esbuild等)の脆弱性は `npm audit --omit=dev` を必須ゲートにして分離、全体auditはinformationalとして監視する。 <!-- cid:build-and-test:c1 -->
- 2026-06-21 [Tradeoff] マルチconfig monorepoの集約カバレッジは誤解を招く。カバレッジは実行コードに範囲を絞り(型定義barrel・エントリ配線・別環境でテストする層を除外)、別runの層(web等)は個別に閾値判定する。素の集約値で品質を判断しない。 <!-- cid:build-and-test:c2 -->
