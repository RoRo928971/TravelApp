/**
 * アプリ全体の設定値。
 * Expo の公開環境変数（EXPO_PUBLIC_*）から読み込む。`.env` は .env.example を参照。
 *
 * - Supabase の URL/anon key が両方あれば「クラウドモード」（認証・同期・リアルタイム）
 * - なければ「ローカルモード」（AsyncStorage + モックデータ）で起動する
 * - Foursquare のキーがあれば実 API、なければモックの場所DBを使う
 */
export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  foursquareApiKey: process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY ?? '',
} as const;

export const hasSupabase = Boolean(config.supabaseUrl && config.supabaseAnonKey);
export const hasFoursquare = Boolean(config.foursquareApiKey);
