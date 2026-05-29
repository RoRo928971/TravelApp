import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChecklistItem, Stop, Trip } from '../types/models';
import type { TripRepository } from './repository';
import { seedTrip } from './seed';

const KEY = 'tabi-no-shiori-trip-v1';

/**
 * ローカル（オフライン）リポジトリ。
 * Supabase 未設定でもアプリが完全に動くようにするための実装。
 * 承認済みモックと同じ初期データから始まる。
 */
export class LocalRepository implements TripRepository {
  private trip: Trip | null = null;
  private listeners = new Set<() => void>();

  async loadTrip(): Promise<Trip> {
    if (this.trip) return this.trip;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      this.trip = raw ? (JSON.parse(raw) as Trip) : seedTrip();
    } catch {
      this.trip = seedTrip();
    }
    await this.persist();
    return this.trip;
  }

  async reset(): Promise<Trip> {
    this.trip = seedTrip();
    await this.persist();
    this.emit();
    return this.trip;
  }

  async setTitle(title: string): Promise<void> {
    const trip = await this.loadTrip();
    trip.title = title;
    await this.persist();
    this.emit();
  }

  async saveStop(stop: Stop): Promise<void> {
    const trip = await this.loadTrip();
    const day = trip.days.find((d) => d.id === stop.dayId);
    if (!day) return;
    const idx = day.stops.findIndex((s) => s.id === stop.id);
    if (idx >= 0) day.stops[idx] = stop;
    else day.stops.push(stop);
    day.stops.sort((a, b) => a.time.localeCompare(b.time));
    await this.persist();
    this.emit();
  }

  async deleteStop(stopId: string): Promise<void> {
    const trip = await this.loadTrip();
    for (const day of trip.days) {
      day.stops = day.stops.filter((s) => s.id !== stopId);
    }
    await this.persist();
    this.emit();
  }

  async saveChecklistItem(item: ChecklistItem): Promise<void> {
    const trip = await this.loadTrip();
    const idx = trip.checklist.findIndex((c) => c.id === item.id);
    if (idx >= 0) trip.checklist[idx] = item;
    else trip.checklist.push(item);
    await this.persist();
    this.emit();
  }

  async deleteChecklistItem(itemId: string): Promise<void> {
    const trip = await this.loadTrip();
    trip.checklist = trip.checklist.filter((c) => c.id !== itemId);
    await this.persist();
    this.emit();
  }

  async createInvite(): Promise<string> {
    throw new Error('招待はクラウドモード（Supabase 設定時）で利用できます');
  }

  async acceptInvite(): Promise<void> {
    throw new Error('招待はクラウドモード（Supabase 設定時）で利用できます');
  }

  subscribe(onChange: () => void): () => void {
    this.listeners.add(onChange);
    return () => this.listeners.delete(onChange);
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  private async persist() {
    if (this.trip) await AsyncStorage.setItem(KEY, JSON.stringify(this.trip));
  }
}
