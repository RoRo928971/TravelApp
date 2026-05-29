import type { SceneKey } from '../../types/models';

/** 検索結果 1 件（地図サービスから取得した店舗・スポット） */
export interface PlaceResult {
  id: string;
  name: string;
  scene: SceneKey;
  rating: string; // '4.5' など。未取得は '—'
  category: string; // '寺社' 'カフェ' 等
  address: string;
  hours: string;
  budget: string;
  /** おすすめの開始時刻（行程に追加する際の初期値） */
  suggestedTime: string;
  photoUrl?: string | null;
}

/** 場所検索プロバイダの共通インターフェース（Foursquare / Mock を差し替え可能に） */
export interface PlacesProvider {
  readonly id: string;
  search(query: string): Promise<PlaceResult[]>;
}
