import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { hasSupabase } from '../config';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useTrip } from './TripContext';

/** 編集対象（相手に「どこを触っているか」を伝えるための情報） */
export interface EditTarget {
  kind: 'stop' | 'checklist' | 'title';
  id?: string;
  label?: string;
}

interface PresencePayload {
  name: string;
  editing: EditTarget | null;
  ts: number;
}

interface PresenceContextValue {
  /** 相手がオンラインか（クラウドモードのみ true になりうる） */
  partnerOnline: boolean;
  /** 相手が編集中の予定 ID（なければ null）。カードの編集中バッジ表示に使う */
  partnerEditingStopId: string | null;
  /** 相手が編集中のチェック項目 ID */
  partnerEditingChecklistId: string | null;
  /** ヘッダーに出す相手の状態文（オンライン / ○○が編集中…）。なければ null */
  partnerStatusText: string | null;
  /** 相手の表示名 */
  partnerName: string | null;
  /** 自分の編集対象を更新して相手へ通知する */
  reportEditing: (target: EditTarget | null) => void;
}

const PresenceContext = createContext<PresenceContextValue>({
  partnerOnline: false,
  partnerEditingStopId: null,
  partnerEditingChecklistId: null,
  partnerStatusText: null,
  partnerName: null,
  reportEditing: () => {},
});

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { trip } = useTrip();
  const { cloud, session } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const editingRef = useRef<EditTarget | null>(null);
  const nameRef = useRef('パートナー');

  const [partner, setPartner] = useState<PresencePayload | null>(null);

  const myKey = session?.user?.id ?? 'local-user';
  const myName = session?.user?.email?.split('@')[0] ?? 'パートナー';
  const tripId = trip?.id ?? null;
  nameRef.current = myName;

  // 2 人想定：自分以外の最初の presence を「相手」とみなす
  const recompute = useCallback(
    (channel: RealtimeChannel) => {
      const state = channel.presenceState<PresencePayload>();
      let found: PresencePayload | null = null;
      for (const [key, metas] of Object.entries(state)) {
        if (key === myKey) continue;
        const meta = metas[metas.length - 1];
        if (meta) found = meta;
      }
      setPartner(found);
    },
    [myKey],
  );

  useEffect(() => {
    // クラウドモードかつ旅程が決まっているときのみ presence を有効化
    if (!hasSupabase || !cloud || !supabase || !tripId || !session) return;

    const client = supabase;
    const channel = client.channel(`presence:${tripId}`, {
      config: { presence: { key: myKey } },
    });
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => recompute(channel))
      .on('presence', { event: 'join' }, () => recompute(channel))
      .on('presence', { event: 'leave' }, () => recompute(channel))
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void channel.track({ name: myName, editing: editingRef.current, ts: Date.now() });
        }
      });

    return () => {
      channelRef.current = null;
      client.removeChannel(channel);
      setPartner(null);
    };
  }, [cloud, tripId, session, myKey, myName, recompute]);

  const reportEditing = useCallback((target: EditTarget | null) => {
    editingRef.current = target;
    const channel = channelRef.current;
    if (channel) {
      void channel.track({ name: nameRef.current, editing: target, ts: Date.now() });
    }
  }, []);

  const partnerOnline = partner !== null;
  const partnerEditingStopId =
    partner?.editing?.kind === 'stop' ? partner.editing.id ?? null : null;
  const partnerEditingChecklistId =
    partner?.editing?.kind === 'checklist' ? partner.editing.id ?? null : null;

  let partnerStatusText: string | null = null;
  if (partner) {
    partnerStatusText = partner.editing
      ? `${partner.name}さんが編集中…`
      : `${partner.name}さんがオンライン`;
  }

  const value: PresenceContextValue = {
    partnerOnline,
    partnerEditingStopId,
    partnerEditingChecklistId,
    partnerStatusText,
    partnerName: partner?.name ?? null,
    reportEditing,
  };

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

export function usePresence(): PresenceContextValue {
  return useContext(PresenceContext);
}
