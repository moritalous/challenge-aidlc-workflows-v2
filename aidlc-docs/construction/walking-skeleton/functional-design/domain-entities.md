# Domain Entities — Walking Skeleton

> Status: Draft (awaiting approval gate)
> Scope: Bolt 1 (walking skeleton) 薄い1リソース縦スライス
> Upstream: `unit-of-work.md`, `component-methods.md`, `requirements.md`

2層のドメインエンティティを定義する。

## (A) 雛形ツール側のコアエンティティ

### IntentModel（意図の安定スキーマ, ADR-004 / U0契約）
| フィールド | 型 | 説明 |
|-----------|----|----|
| entities | `{ name, fields: {name,type}[] }[]` | 生成対象のドメインエンティティ |
| screens | `("list"\|"detail"\|"create"\|"confirm"\|"empty")[]` | 生成する画面種別 |
| operations | `("create"\|"update"\|"delete"\|"changeStatus")[]` | U0契約（component-methods.md:15）と一致。skeletonでは `changeStatus` は **`update`(PUT)による単純更新として実現**し、専用の状態遷移規則・専用UIは持たない（下記F2注） |

### GateResult（品質ゲートの判定結果, U0契約）
| フィールド | 型 | 説明 |
|-----------|----|----|
| pillar | `"test"\|"static"\|"security"\|"deploy"` | 4本柱のどれか |
| status | `"PASS"\|"FAIL"\|"PENDING"\|"ERROR"` | 4状態。PENDING/ERRORを非PASSとして扱う典拠=US-D2 AC2/AC3（保留・エラーを合格と見せない）。部分合格=不合格 の典拠=US-B2 AC3 |
| details | `string` | 不合格箇所・理由 |

### Project / BuildArtifact（生成プロジェクトの契約, U0 / 循環遮断）
| フィールド | 型 | 説明 |
|-----------|----|----|
| files | `{ path, content }[]` | 生成されたソース群 |
| iacEntry | `string` | CDKエントリポイント（U8が所有, U7が消費） |
| traceability | `Map<intentItem, filePaths>` | 意図→生成物の対応（FR-1.4）。**所有層=U3生成器の `GenOutput`**（component-methods.md と命名一致）。`Project` 契約はこれをメタとして搬送するのみ（U0契約は構造の入れ物で、生成の意味づけはU3が持つ）。 |

## (B) 生成アプリ側のドメインエンティティ（参照CRUD: Task）

### Task（薄い1リソース）
| フィールド | 型 | 制約 |
|-----------|----|----|
| id | string (UUID) | PK |
| title | string | 必須・1〜200文字 |
| status | `"Todo"\|"Doing"\|"Done"` | 既定 Todo。skeletonでは**自由更新属性**（`update`/PUTで任意に変更可、専用の遷移規則なし） |
| dueDate | string (ISO date) | 任意・有効な日付 |
| createdAt | string (ISO datetime) | 自動 |
| updatedAt | string (ISO datetime) | 自動 |

> DynamoDBテーブル: PK=`id`。skeletonは単一テーブル・単一リソース。
> Authはシードユーザー前提（AC-5スタブ, FR-7.1でスコープ外を明示）。
>
> **F2注（status/changeStatus）:** `IntentModel.operations` は U0契約（component-methods.md:15）どおり `changeStatus` を**含む**（契約値は除外しない）。skeletonでは `changeStatus` を `update`(PUT) による `status` の単純更新として実現し、`status` は自由更新属性として扱う。状態遷移を**制約する規則**（許可遷移グラフ・専用UI・遷移バリデーション）のみが **skeletonスコープ外**（後続Boltで定義）。スコープ外なのは「遷移規則」であって「契約の列挙値」ではない — これにより契約と実装の矛盾を解消。

## エンティティ関係
- skeletonでは Task のみ（関連エンティティなし）。
- 拡張（複数リソース・関連）は後続Boltで `IntentModel.entities` を増やすことで対応。
