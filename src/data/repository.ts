import type { ChecklistItem, Stop, Trip } from '../types/models';
import { hasSupabase } from '../config';
import { LocalRepository } from './localRepository';
import { SupabaseRepository } from './supabaseRepository';

/**
 * データ永続化の抽象。ローカル（AsyncStorage）と Supabase を差し替え可能にする。
 * UI 層はこのインターフェースだけに依存する。
 */
export interface TripRepository {
  /** 旅程の読み込み（なければ初期化） */
  loadTrip(): Promise<Trip>;
  setTitle(title: string): Promise<void>;
  /** 予定の追加・更新（upsert） */
  saveStop(stop: Stop): Promise<void>;
  deleteStop(stopId: string): Promise<void>;
  /** チェック項目の追加・更新（upsert） */
  saveChecklistItem(item: ChecklistItem): Promise<void>;
  deleteChecklistItem(itemId: string): Promise<void>;
  /** 初期状態へ戻す（ローカルモードのデモ用） */
  reset(): Promise<Trip>;

  /** 共同編集者を招待するコードを発行（クラウドモードのみ） */
  createInvite(): Promise<string>;
  /** 招待コードを受諾して旅程に参加（クラウドモードのみ） */
  acceptInvite(code: string): Promise<void>;
  /**
   * リアルタイム変更の購読。相手の編集が入ると onChange が呼ばれる。
   * 戻り値で購読解除する。
   */
  subscribe(onChange: () => void): () => void;
}

let cached: TripRepository | null = null;

export function getRepository(): TripRepository {
  if (cached) return cached;
  cached = hasSupabase ? new SupabaseRepository() : new LocalRepository();
  return cached;
}
