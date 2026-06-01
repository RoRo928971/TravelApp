# 旅のしおり — ふたりの共同編集プランナー

二人で共同編集する旅行プランナー。日ごとのタイムライン式の行程作成と、担当者付きの持ち物・やることチェックリストを、和紙の質感＋明朝体の落ち着いたデザインで。

- **共同編集**: あなた=深緑／相手=柿色で色分け、誰が何を編集中かを表示
- **場所検索**: 地図サービスから写真・評価・営業時間・予算・住所を自動取得
- **リアルタイム同期**: Supabase Realtime（クラウドモード）

## 技術スタック

| 領域 | 採用 |
| --- | --- |
| フロント | React Native / Expo (SDK 56) + TypeScript |
| バックエンド | Supabase（Postgres / Auth / Realtime） |
| 場所情報 | Foursquare Places API（未設定時はモック） |

## セットアップ

```bash
npm install
npm start          # Expo Dev Server（i: iOS / a: Android / w: Web）
```

### 動作モード
環境変数の有無で自動的に切り替わります（`.env.example` を `.env` にコピー）。

- **ローカルモード**（既定 / 環境変数なし）: 端末内 AsyncStorage ＋モックデータで全機能が動く。バックエンド不要ですぐ起動。
- **クラウドモード**（Supabase 設定あり）: マジックリンク認証・データ保存・二人のリアルタイム同期。

Supabase の手順は [`supabase/README.md`](./supabase/README.md) を参照。

## ディレクトリ構成

```
App.tsx                  フォント読み込み・認証ゲート・プロバイダ
src/
  config/                環境変数とモード判定
  theme/                 デザイントークン（色・フォント）
  types/                 ドメインモデル
  data/                  リポジトリ層（Local / Supabase）・初期データ・SVG風景
  providers/places/      場所検索プロバイダ（Foursquare / Mock）
  lib/                   Supabase クライアント・ユーティリティ
  hooks/                 useAuth など
  state/                 TripContext / ToastContext
  components/            StopCard / ChecklistRow / Avatar / SceneThumb / Icon
  screens/               MainScreen / ItineraryView / ChecklistView / PlaceSearchSheet / AuthScreen
supabase/                schema.sql とセットアップ手順
mock/                    承認済みデザインモック（参照用 HTML）
```

## ロードマップ（骨組みの次）

- [x] Supabase メンバー招待フロー（リンク共有）
- [x] Foursquare の写真取得（`/photos` エンドポイント）と地域指定
- [ ] presence（相手のカーソル・編集中表示）のリアルタイム連携
- [ ] 日（Day）の追加・並べ替え
- [ ] 行程の共有・PDF/印刷出力

### 招待フロー（実装済み）
ヘッダーの人物＋アイコンから招待リンクを発行し、共有（OS の共有シート）できます。
相手がリンクを開くと `tabinoshiori://invite?code=...` を解析し、`accept_trip_invite` RPC で
旅程に参加します（クラウドモードのみ）。コードは 14 日間有効。
