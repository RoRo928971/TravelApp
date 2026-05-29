/**
 * ドメインモデル。UI とリポジトリ層で共有する。
 *
 * 二人の色分けは `MemberRole`（'me' = あなた=深緑 / 'partner' = 相手=柿色）で表す。
 * クラウドモードでは閲覧者自身を 'me'、もう一人を 'partner' に写像する想定。
 */
export type MemberRole = 'me' | 'partner';

/** 風景サムネイル（mock/index.html の scene() と対応するキー） */
export type SceneKey =
  | 'station'
  | 'market'
  | 'kiyomizu'
  | 'gion'
  | 'bamboo'
  | 'tofu'
  | 'kinkaku'
  | 'onsen'
  | 'torii'
  | 'cafe';

/** 地図サービスから自動取得するお店情報 */
export interface PlaceInfo {
  hours: string; // 営業時間
  budget: string; // 予算
  addr: string; // 住所
  tag: string; // カテゴリ
  rate: string; // 評価（'—' は未取得）
  photoUrl?: string | null; // 実 API 利用時の写真 URL
}

/** タイムライン上の 1 予定 */
export interface Stop {
  id: string;
  dayId: string;
  time: string; // 'HH:MM'
  place: string;
  note: string;
  by: MemberRole; // 担当者
  scene: SceneKey;
  info: PlaceInfo;
  editingBy?: MemberRole | null; // 現在編集中の人（リアルタイム表示用）
}

export interface Day {
  id: string;
  label: string; // 'Day 1'
  date: string; // '3月14日'
  sub: string; // '金 · 京都着'
  stops: Stop[];
}

export interface ChecklistItem {
  id: string;
  category: 'common' | 'todo'; // 持ち物 / やること
  text: string;
  owner: MemberRole;
  done: boolean;
}

export interface Trip {
  id: string;
  title: string;
  dateRange: string; // '3.14 金 — 3.16 日'
  nights: string; // '2泊3日'
  days: Day[];
  checklist: ChecklistItem[];
}

/** リアルタイム presence（誰がオンラインで、今どこを見ているか） */
export interface PresenceState {
  role: MemberRole;
  name: string;
  online: boolean;
  status?: string; // '○○が編集中…' など
}
