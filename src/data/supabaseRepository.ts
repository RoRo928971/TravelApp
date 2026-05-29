import { supabase } from '../lib/supabase';
import type { ChecklistItem, Day, Stop, Trip } from '../types/models';
import type { TripRepository } from './repository';
import { seedTrip } from './seed';

/**
 * Supabase リポジトリ（クラウドモード）。
 * supabase/schema.sql のテーブルに対して読み書きし、Realtime で相手の編集を購読する。
 *
 * NOTE: 骨組み段階。1 アプリ = 1 旅程（最初にアクセスできる trip）を対象にしている。
 * 複数旅程・招待フローは今後追加する。
 */
export class SupabaseRepository implements TripRepository {
  private tripId: string | null = null;

  private get db() {
    if (!supabase) throw new Error('Supabase client is not configured');
    return supabase;
  }

  async loadTrip(): Promise<Trip> {
    let query = this.db.from('trips').select('id, title, date_range, nights');
    // 招待で参加した旅程など、アクティブな trip が決まっていればそれを優先
    query = this.tripId ? query.eq('id', this.tripId) : query.order('created_at').limit(1);
    const { data: trips, error } = await query;
    if (error) throw error;

    // まだ旅程が無ければ初期データを作成（初回サインイン時）
    if (!trips || trips.length === 0) {
      // tripId 指定で見つからなければ指定を解除して再取得
      if (this.tripId) {
        this.tripId = null;
        return this.loadTrip();
      }
      return this.bootstrap();
    }

    const t = trips[0];
    this.tripId = t.id;

    const [{ data: days }, { data: stops }, { data: items }] = await Promise.all([
      this.db.from('days').select('*').eq('trip_id', t.id).order('position'),
      this.db.from('stops').select('*').order('time'),
      this.db.from('checklist_items').select('*').eq('trip_id', t.id).order('position'),
    ]);

    const dayList: Day[] = (days ?? []).map((d: any) => ({
      id: d.id,
      label: d.label,
      date: d.date,
      sub: d.sub,
      stops: (stops ?? [])
        .filter((s: any) => s.day_id === d.id)
        .map(
          (s: any): Stop => ({
            id: s.id,
            dayId: s.day_id,
            time: s.time,
            place: s.place,
            note: s.note ?? '',
            by: s.by_role,
            scene: s.scene,
            info: s.info,
            editingBy: s.editing_by ?? null,
          }),
        ),
    }));

    return {
      id: t.id,
      title: t.title,
      dateRange: t.date_range,
      nights: t.nights,
      days: dayList,
      checklist: (items ?? []).map(
        (c: any): ChecklistItem => ({
          id: c.id,
          category: c.category,
          text: c.text,
          owner: c.owner_role,
          done: c.done,
        }),
      ),
    };
  }

  /** 初回サインイン時に初期データ（モック相当）を投入する */
  private async bootstrap(): Promise<Trip> {
    const seed = seedTrip();
    const { data, error } = await this.db
      .from('trips')
      .insert({ title: seed.title, date_range: seed.dateRange, nights: seed.nights })
      .select('id')
      .single();
    if (error) throw error;
    this.tripId = data.id;

    for (const [pos, day] of seed.days.entries()) {
      await this.db.from('days').insert({
        id: day.id,
        trip_id: data.id,
        label: day.label,
        date: day.date,
        sub: day.sub,
        position: pos,
      });
      for (const s of day.stops) await this.saveStop(s);
    }
    for (const [pos, item] of seed.checklist.entries()) {
      await this.db.from('checklist_items').insert({
        id: item.id,
        trip_id: data.id,
        category: item.category,
        text: item.text,
        owner_role: item.owner,
        done: item.done,
        position: pos,
      });
    }
    return this.loadTrip();
  }

  async setTitle(title: string): Promise<void> {
    if (!this.tripId) return;
    await this.db.from('trips').update({ title }).eq('id', this.tripId);
  }

  async saveStop(stop: Stop): Promise<void> {
    await this.db.from('stops').upsert({
      id: stop.id,
      day_id: stop.dayId,
      time: stop.time,
      place: stop.place,
      note: stop.note,
      by_role: stop.by,
      scene: stop.scene,
      info: stop.info,
      editing_by: stop.editingBy ?? null,
    });
  }

  async deleteStop(stopId: string): Promise<void> {
    await this.db.from('stops').delete().eq('id', stopId);
  }

  async saveChecklistItem(item: ChecklistItem): Promise<void> {
    if (!this.tripId) return;
    await this.db.from('checklist_items').upsert({
      id: item.id,
      trip_id: this.tripId,
      category: item.category,
      text: item.text,
      owner_role: item.owner,
      done: item.done,
    });
  }

  async deleteChecklistItem(itemId: string): Promise<void> {
    await this.db.from('checklist_items').delete().eq('id', itemId);
  }

  async reset(): Promise<Trip> {
    // クラウドモードでは破壊的リセットは行わず、現状を返す
    return this.loadTrip();
  }

  async createInvite(): Promise<string> {
    if (!this.tripId) await this.loadTrip();
    if (!this.tripId) throw new Error('旅程が見つかりません');
    const { data, error } = await this.db.rpc('create_trip_invite', { t: this.tripId });
    if (error) throw error;
    return data as string;
  }

  async acceptInvite(code: string): Promise<void> {
    const { data, error } = await this.db.rpc('accept_trip_invite', { invite_code: code });
    if (error) throw error;
    // 参加した旅程をアクティブにする
    this.tripId = (data as string) ?? this.tripId;
  }

  subscribe(onChange: () => void): () => void {
    const channel = this.db
      .channel('trip-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stops' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_items' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, onChange)
      .subscribe();
    return () => {
      this.db.removeChannel(channel);
    };
  }
}
