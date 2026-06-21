# Security Design — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Upstream: `nfr-requirements/security-requirements.md`, `aidlc-project.md`(Forbidden/Mandated)
> security柱(SEC-T1〜T3)の合成と、生成アプリの防御設計。

## (A) 雛形ツールのセキュリティ設計

### security柱の構成（4本柱の1つ）
```
security柱 = AND( npm_audit(High/Crit=0), trivy(High/Crit=0),
                  gitleaks(secrets=0), semgrep(High=0) )
→ いずれか > 0 で security柱 = FAIL → ゲート全体 fail-closed(BR-T1)
```
- 各スキャナの出力を `GateResult{ pillar:"security", status, details }` に正規化。details に検出件数・該当箇所を格納（US-D2: 不合格理由提示）。
- スキャナ自体の異常終了は `ERROR`（非PASS）。

### 認証情報の取り扱い（SEC-T5 / project Forbidden）
- CodeGenProvider のAPIキー・AWS資格情報は **環境変数 / 標準クレデンシャルチェーン** からのみ取得。
- 生成コード・テンプレート・ログ・監査エントリに秘匿情報を出力しない。gitleaks が自フットプリントも対象に含む。

## (B) 生成アプリのセキュリティ設計

| 防御 | 設計 | 典拠 |
|------|------|------|
| 入力検証 | Hono の zod validator で全エンドポイント境界をスキーマ検証。不正は400+構造化エラー | SEC-A1 / BR-A2 |
| 認証スタブ | シードユーザーをミドルウェアで検証。トークンは httpOnly Cookie 想定（skeletonはスタブ） | SEC-A2 |
| シークレット | DynamoDBテーブル名・region等は環境変数注入。コードに定数で埋めない | SEC-A3 |
| 最小権限IAM | CDKで Lambda 実行ロールに対象テーブルの `GetItem/PutItem/UpdateItem/DeleteItem/Query` のみ付与 | SEC-A4 |
| 転送暗号化 | API Gateway / CloudFront は HTTPS のみ（HTTP→HTTPS リダイレクト） | SEC-A5 |

```ts
// 入力検証の例（Hono + zod）。境界で弾く（BR-A2）。
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const TaskCreate = z.object({
  title: z.string().min(1).max(200),
  dueDate: z.string().datetime().optional(),
});
app.post("/tasks", zValidator("json", TaskCreate), async (c) => { /* ... */ });
```

## 脅威・残存リスク
- skeletonの認証はスタブのため、セッション固定・CSRF等の本格対策は認証導入Boltで設計。
- 主要データフロー境界（CloudFront→APIGW→Lambda→DynamoDB）の各段で検証/認可を確認済み。
