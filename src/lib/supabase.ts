import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config, hasSupabase } from '../config';

/**
 * Supabase クライアント。クラウドモードのときのみ生成される。
 * React Native では auth のセッション保存に AsyncStorage を使う。
 * （URL ポリフィルは App.tsx 冒頭の 'react-native-url-polyfill/auto' で適用）
 */
export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
