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
