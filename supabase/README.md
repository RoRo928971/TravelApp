# Supabase セットアップ

「旅のしおり」のクラウドモード（認証・データ保存・リアルタイム共同編集）を有効にする手順です。

## 1. プロジェクト作成
1. https://supabase.com でプロジェクトを作成
2. **Settings → API** から `Project URL` と `anon public key` を取得

## 2. スキーマ適用
1. Supabase ダッシュボードの **SQL Editor** を開く
2. [`schema.sql`](./schema.sql) の内容を貼り付けて実行

## 3. 環境変数
リポジトリ直下の `.env`（`.env.example` をコピー）に設定します。

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

これらが設定されると、アプリは自動的に **クラウドモード**（マジックリンク認証 + 同期）で起動します。
未設定の場合は **ローカルモード**（端末内 AsyncStorage + モックデータ）で全機能が動きます。

## 4. 認証
現状はメールのマジックリンク（`signInWithOtp`）。**Authentication → Providers → Email** を有効にしてください。

## 5. メンバー招待（実装済み）
アプリのヘッダーの「人物＋」アイコンから招待リンクを発行できます。

- `create_trip_invite(trip_id)` … メンバーが招待コードを発行（14 日有効）
- `accept_trip_invite(code)` … 招待リンクを開いた相手が旅程に参加（`trip_members` に追加）

どちらも `SECURITY DEFINER` 関数で、非メンバーでも安全に参加できるよう RLS を内部で越えます。
ディープリンクのスキームは `app.json` の `scheme`（`tabinoshiori`）です。
