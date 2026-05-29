import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { hasSupabase } from '../config';
import { parseInviteCode } from '../lib/invites';
import { useTrip } from '../state/TripContext';
import { useToast } from '../state/ToastContext';

/**
 * 起動時・実行中に届く招待ディープリンクを処理する。
 * クラウドモードのみ有効。リンクに含まれるコードで旅程へ自動参加する。
 */
export function InviteHandler() {
  const url = Linking.useURL();
  const { acceptInvite } = useTrip();
  const { showToast } = useToast();
  const handled = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!hasSupabase) return;
    const code = parseInviteCode(url);
    if (!code || handled.current.has(code)) return;
    handled.current.add(code);
    acceptInvite(code)
      .then(() => showToast('旅のしおりに参加しました', 'sys'))
      .catch((e: unknown) => showToast(e instanceof Error ? e.message : '招待の受諾に失敗しました', 'sys'));
  }, [url, acceptInvite, showToast]);

  return null;
}
