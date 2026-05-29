import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getRepository } from '../data/repository';
import type { PlaceResult } from '../providers/places';
import { makeId } from '../lib/id';
import type { ChecklistItem, MemberRole, Stop, Trip } from '../types/models';

interface TripContextValue {
  trip: Trip | null;
  loading: boolean;

  /** 今操作している人（あなた=me / 相手=partner）。UI の色分けと担当付与に使う */
  acting: MemberRole;
  toggleActing: () => void;

  /** リアルタイム presence 表示文 */
  presence: string;
  setPresence: (text: string) => void;
  idlePresence: () => void;

  setTitle: (title: string) => void;
  addStopFromPlace: (dayId: string, place: PlaceResult) => void;
  updateStop: (stop: Stop) => void;
  deleteStop: (stopId: string) => void;
  toggleStopOwner: (stop: Stop) => void;

  addChecklistItem: (category: 'common' | 'todo', text: string) => void;
  updateChecklistItem: (item: ChecklistItem) => void;
  deleteChecklistItem: (itemId: string) => void;

  reset: () => void;

  /** 共同編集者の招待コードを発行 */
  createInvite: () => Promise<string>;
  /** 招待コードを受諾して旅程に参加し、再読み込み */
  acceptInvite: (code: string) => Promise<void>;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const repo = getRepository();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<MemberRole>('me');
  const [presence, setPresence] = useState('ふたりで編集中');
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    const t = await repo.loadTrip();
    // 参照差し替えで再レンダリングを確実にする
    setTrip({ ...t, days: t.days.map((d) => ({ ...d })) });
  }, [repo]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await repo.loadTrip();
      if (mounted) {
        await refresh();
        setLoading(false);
      }
    })();
    const unsub = repo.subscribe(() => {
      void refresh();
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, [repo, refresh]);

  const toggleActing = useCallback(() => setActing((a) => (a === 'me' ? 'partner' : 'me')), []);

  const idlePresence = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setPresence('ふたりで編集中'), 1800);
  }, []);

  const setTitle = useCallback(
    (title: string) => {
      void repo.setTitle(title).then(refresh);
    },
    [repo, refresh],
  );

  const addStopFromPlace = useCallback(
    (dayId: string, place: PlaceResult) => {
      const stop: Stop = {
        id: makeId('stop'),
        dayId,
        time: place.suggestedTime,
        place: place.name,
        note: `${place.category}・${place.address}`,
        by: acting,
        scene: place.scene,
        info: {
          hours: place.hours,
          budget: place.budget,
          addr: place.address,
          tag: place.category,
          rate: place.rating,
          photoUrl: place.photoUrl ?? null,
        },
      };
      void repo.saveStop(stop).then(refresh);
    },
    [repo, refresh, acting],
  );

  const updateStop = useCallback(
    (stop: Stop) => {
      void repo.saveStop(stop).then(refresh);
    },
    [repo, refresh],
  );

  const deleteStop = useCallback(
    (stopId: string) => {
      void repo.deleteStop(stopId).then(refresh);
    },
    [repo, refresh],
  );

  const toggleStopOwner = useCallback(
    (stop: Stop) => {
      void repo
        .saveStop({ ...stop, by: stop.by === 'me' ? 'partner' : 'me' })
        .then(refresh);
    },
    [repo, refresh],
  );

  const addChecklistItem = useCallback(
    (category: 'common' | 'todo', text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const item: ChecklistItem = {
        id: makeId('chk'),
        category,
        text: trimmed,
        owner: acting,
        done: false,
      };
      void repo.saveChecklistItem(item).then(refresh);
    },
    [repo, refresh, acting],
  );

  const updateChecklistItem = useCallback(
    (item: ChecklistItem) => {
      void repo.saveChecklistItem(item).then(refresh);
    },
    [repo, refresh],
  );

  const deleteChecklistItem = useCallback(
    (itemId: string) => {
      void repo.deleteChecklistItem(itemId).then(refresh);
    },
    [repo, refresh],
  );

  const reset = useCallback(() => {
    void repo.reset().then(refresh);
  }, [repo, refresh]);

  const createInvite = useCallback(() => repo.createInvite(), [repo]);

  const acceptInvite = useCallback(
    async (code: string) => {
      await repo.acceptInvite(code);
      await refresh();
    },
    [repo, refresh],
  );

  const value: TripContextValue = {
    trip,
    loading,
    acting,
    toggleActing,
    presence,
    setPresence,
    idlePresence,
    setTitle,
    addStopFromPlace,
    updateStop,
    deleteStop,
    toggleStopOwner,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    reset,
    createInvite,
    acceptInvite,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within TripProvider');
  return ctx;
}
