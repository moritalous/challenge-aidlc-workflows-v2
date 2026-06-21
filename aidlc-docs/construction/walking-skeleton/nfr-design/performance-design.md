# Performance Design — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `nfr-requirements/performance-requirements.md`, `business-logic-model.md`
> 設計判断で性能要件(PERF-T1〜T3 / PERF-A1〜A3)をどう満たすか。

## (A) 雛形ツールの性能設計

| 要件 | 設計手段 |
|------|----------|
| PERF-T2（ゲート≤5分） | 4柱を **並列実行**（`Promise.allSettled`）。柱間に依存なし（BR-T1 AND合成）。最遅柱が律速 → 各柱に個別タイムアウト |
| PERF-T1（1回転≤15分） | Parsing/Generating/Gating/Deploying を直列だが各段にタイムアウト。CodeGen呼び出しは1回/段に集約 |
| PERF-T3（解析≤60秒） | `CodeGenProvider.parse()` 1往復。プロンプトは意図要約に限定しトークン量を抑制 |

```ts
// 4柱並列ゲート（タイムアウト付き）。PENDING/ERRORは非PASS(BR-T1)。
// 抜粋: GateResult/GateContext は U0契約、runTest等・withTimeout は別途定義。
const PILLAR_NAMES = ["test", "static", "security", "deploy"] as const
  satisfies readonly GateResult["pillar"][];

async function runGate(ctx: GateContext): Promise<GateResult[]> {
  const pillars = [runTest, runStatic, runSecurity, runDeploy];
  const settled = await Promise.allSettled(
    pillars.map((p) => withTimeout(p(ctx), PILLAR_TIMEOUT_MS))
  );
  return settled.map<GateResult>((s, i) =>
    s.status === "fulfilled"
      ? s.value
      : { pillar: PILLAR_NAMES[i], status: "ERROR", details: String(s.reason) }
  );
}
```

- タイムアウト超過は `ERROR`（非PASS）として扱い、無限待ちを防ぐ（REL-T4 / construction phase）。

## (B) 生成アプリの性能設計

| 要件 | 設計手段 |
|------|----------|
| PERF-A1（API p95≤500ms warm） | Hono 軽量ルータ＋DynamoDB単一PK取得（定数時間）。Lambda メモリは512MB起点で performance-validation 調整 |
| PERF-A2（ヘルス HTTP200/5秒） | `/health` は依存呼び出しなしの即時200。デプロイ後スモークで検証 |
| PERF-A3（LCP≤2.5秒） | Vite ビルドのコード分割＋CloudFront エッジキャッシュ。初期一覧は最小ペイロード |

- DynamoDB アクセスは `GetItem`/`Query`（PK=id）に限定しスキャン禁止。
- コールドスタートは別計測（performance-requirements PERF-A1 測定方法に従う）。

## 計測・検証
- すべての目標値は performance-validation stage で実測確定。本設計は満たすための構造を定義。
