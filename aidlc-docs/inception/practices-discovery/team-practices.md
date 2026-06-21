# Team Practices — AIネイティブ Webアプリ雛形

> Greenfield。org既定を確認(affirm)し、プロジェクト固有として品質ゲートのfail-closed必須化を追加。

## Way of Working

トランクベース開発を採用する。すべての作業は短命なフィーチャーブランチからmainへマージし、各Boltはsquashマージでmainに1コミットとして統合する。長命ブランチは避ける。

## Walking Skeleton

グリーンフィールドのfeatureスコープのため、walking-skeletonを最初に実行する（on）。Bolt 1は単独・ゲート付きで、ユーザー承認後に残りのBoltが走る。

## Testing Posture

テストはコードと並行して書く第一級の成果物とする。最低80%のラインカバレッジを満たし、CIでマージ前にテストを実行する。

## Deployment

マージでstaging環境へ自動デプロイする。本番デプロイは別途の手動承認ゲート（tech lead + product owner相当の承認）で行う。

## Code Style

言語デフォルトに従う。TypeScriptはPrettier（フォーマッタ）＋ESLint（リンタ）をリポジトリ設定で強制し、CIでマージ前に実行する。命名は言語慣用（TSはcamelCase）。
