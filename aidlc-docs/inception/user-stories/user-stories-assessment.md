# User Stories Assessment — AIネイティブ Webアプリ雛形

> Status: Draft (awaiting approval gate)
> Upstream: `stories.md`, `requirements.md`

## INVEST 評価サマリ

| ストーリー | Independent | Negotiable | Valuable | Estimable | Small | Testable |
|-----------|:-:|:-:|:-:|:-:|:-:|:-:|
| US-A1 | ◯ | ◯ | ◯ | ◯ | ◯(M) | ◯ |
| US-A2 | △(A1依存) | ◯ | ◯ | ◯ | △(L) | ◯ |
| US-B1 | ◯ | ◯ | ◎ | ◯ | △(L) | ◯ |
| US-B2 | △(B1依存) | ◯ | ◯ | ◯ | △(L) | ◯ |
| US-B3 | △(B2依存) | ◯ | ◯ | ◯ | ◯(M) | ◯ |
| US-C1 | ◯ | ◯ | ◯ | ◯ | ◯(M) | ◯ |
| US-C2 | △(B1依存) | ◯ | ◎ | ◯ | △(L) | ◯ |
| US-C3 | ◯ | ◯ | ◯ | ◯ | ◯(M) | ◯ |
| US-D1 | ◯ | ◯ | ◯ | ◯ | ◯(M) | ◯ |
| US-D2 | ◯ | ◯ | ◯ | ◯ | ◎(S) | ◯ |

### L評価ストーリーの見積根拠と分割方針

L（A2/B1/B2/C2）はいずれも「縦スライスとして見積可能」と判断しEstimableは◯。Functional Designで以下の単位に分割予定:
- **US-A2** → フロント生成／API生成／DB(スキーマ)生成 の層別コンポーネント。
- **US-B1** → 柱ごとの検証単位（テスト柱／静的解析・型柱／セキュリティ柱／デプロイ柱）。fail-closedの検証単位＝柱なので自然に分割可能。
- **US-B2** → 修正適用ロジック／再評価ループ制御。
- **US-C2** → デプロイ実行／ヘルスチェック／失敗ロールバック。

> 今ストーリーで分割しない理由: ストーリー段階では「縦の価値」を保つため。分割は実装直前（Functional Design）が適切で、INVESTのEstimableは満たす。

## 要件カバレッジ（FR → Story トレース）

| FR（細目） | Story |
|----|-------|
| FR-1.1/1.2 | US-A1 |
| FR-1.3/1.4 | US-A2 |
| FR-2.1/2.2 | US-B1 |
| FR-2.3 | US-B2 |
| FR-2.4 | US-B3 |
| FR-3.1/3.2/3.3 | US-C1 |
| FR-4.1/4.2/4.3/4.4 | US-C2 (AC1/AC2/AC3/AC4) |
| FR-5.1〜5.4 | US-C3 |
| FR-6.1/6.2 | US-D1 (AC1/AC2) |
| FR-6.3 | US-D1 (AC3) |
| FR-6.4 | US-D2 |
| FR-7 | （除外＝ストーリー化しない、明示済み） |
| NFR-1〜6 | 各ストーリーのAC＋Build/Testで検証（横断的） |

- **孤児FRなし（再検証済み）:** FR-1〜6の全細目がストーリーAC（FR-6.3=US-D1 AC3, FR-4.4=US-C2 AC4 を含む）に対応。FR-7は除外として明示。
- 孤児ストーリーなし（全ストーリーがFRにトレース）。
- 孤児ペルソナなし: P1=全ストーリー主体、P2/P3=ストーリー化しない旨を stories.md に明記。

## walking skeleton スコープ確認

- skeleton包含: US-A1/A2, US-B1/B2/B3, US-C1/C2/C3, US-D1/D2（薄い縦切り1リソース）。
- 「意図→生成→4本柱ゲート→AWSデプロイ」の一連が US-A1→US-B1→US-C2 で端から端まで通る（中核テーゼの実証経路）。

## リスク

- US-A2/US-B群はAI生成の不確実性が高い（最優先で実証）。delivery-planning でこの順序を反映。
