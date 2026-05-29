import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { hasSupabase } from '../config';
import { supabase } from '../lib/supabase';

interface AuthState {
  /** クラウドモードかどうか（false ならローカルで全機能が使える） */
  cloud: boolean;
  loading: boolean;
  session: Session | null;
}

/**
 * 認証状態。
 * - ローカルモード（Supabase 未設定）: 常にサインイン扱いで素通り
 * - クラウドモード: Supabase のセッションを監視
 */
export function useAuth(): AuthState {
  const [loading, setLoading] = useState(hasSupabase);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!hasSupabase || !supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { cloud: hasSupabase, loading, session };
}
