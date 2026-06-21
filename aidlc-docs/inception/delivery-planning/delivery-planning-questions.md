# Delivery Planning — Questions

> Mode: Desk（上流で確定済み: シーケンス=リスクファースト(scope Q4), マージ=squash(team-practices), skeleton first(greenfield feature)）

## Q1. Bolt分割の方針は？
[Answer]: リスクファースト。Bolt 1=walking skeleton（中核テーゼ実証）。以降はリスク/価値の高い順に肉付け。各Boltはsquashでmainへ1コミット。

## Q2. 並列実行は使うか？
[Answer]: Bolt 1は単独・ゲート付き（team-practices/org: skeleton on）。Bolt 2以降は依存が許す範囲で並列バッチ可（autonomyはladder promptで決定）。

## Q3. 外部依存で先に確保すべきものは？
[Answer]: AIモデル/プロバイダ(CodeGenProvider背後)、AWSアカウント/権限、CIプラットフォーム(GitHub Actions)、セキュリティスキャナ。external-dependency-map参照。
