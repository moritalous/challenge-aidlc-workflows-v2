# Discovered Rules — AIネイティブ Webアプリ雛形

> プロジェクト固有の強制ルール。affirmation後に aidlc-project.md の Mandated/Forbidden へ昇格。

## Mandated

ALWAYS enforce the four quality pillars (automated tests, static-analysis/type-check, security scanning, deployability) as fail-closed CI gates — block merge/progress if any pillar fails.
ALWAYS run security scans (dependency vulnerabilities, secret detection, SAST) as part of the mandatory quality gate for AI-generated code.

## Forbidden

NEVER merge or deploy AI-generated code that has not passed all four fail-closed quality gates.
NEVER hardcode credentials or secrets in generated code or templates — use environment variables or a secrets manager.
