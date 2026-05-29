import type { SceneKey } from '../../types/models';
import type { PlacesProvider, PlaceResult } from './types';

/**
 * Foursquare Places API (v3) を使った実プロバイダ。
 * Google 以外の選択として採用。写真・評価・営業時間・価格帯・住所が無料枠で揃う。
 * APIキーは EXPO_PUBLIC_FOURSQUARE_API_KEY から渡す。
 *
 * NOTE: 検索範囲は当面「京都」に固定（near パラメータ）。
 * 本実装では端末の現在地や旅行先に応じて near / ll を切り替える予定。
 */
const ENDPOINT = 'https://api.foursquare.com/v3/places/search';
const DEFAULT_NEAR = 'Kyoto, Japan';

/** Foursquare のカテゴリ名から、和テイストの風景サムネへざっくり写像する */
function categoryToScene(category: string): SceneKey {
  const c = category.toLowerCase();
  if (/(onsen|spa|bath|hot spring|温泉)/.test(c)) return 'onsen';
  if (/(shrine|temple|神社|寺)/.test(c)) return 'torii';
  if (/(cafe|coffee|tea|カフェ|喫茶)/.test(c)) return 'cafe';
  if (/(market|grocery|食|restaurant|dining|ramen|sushi)/.test(c)) return 'market';
  if (/(park|garden|forest|nature|mountain|公園|庭)/.test(c)) return 'bamboo';
  if (/(bar|night|izakaya|居酒屋)/.test(c)) return 'gion';
  if (/(station|transport|駅)/.test(c)) return 'station';
  return 'kiyomizu';
}

/** Foursquare の価格レベル(1-4)を予算表記へ */
function priceToBudget(price?: number): string {
  switch (price) {
    case 1:
      return '〜¥1,000';
    case 2:
      return '¥1,000〜3,000';
    case 3:
      return '¥3,000〜6,000';
    case 4:
      return '¥6,000〜';
    default:
      return '—';
  }
}

/** rating(0-10) を 5点満点へ */
function normalizeRating(rating?: number): string {
  if (typeof rating !== 'number') return '—';
  return (Math.round((rating / 2) * 10) / 10).toFixed(1);
}

interface FsqPlace {
  fsq_id: string;
  name: string;
  categories?: { name: string }[];
  location?: { formatted_address?: string; address?: string };
  rating?: number;
  price?: number;
  hours?: { display?: string };
}

export class FoursquarePlacesProvider implements PlacesProvider {
  readonly id = 'foursquare';
  constructor(private apiKey: string) {}

  async search(query: string): Promise<PlaceResult[]> {
    const url = `${ENDPOINT}?query=${encodeURIComponent(query)}&near=${encodeURIComponent(
      DEFAULT_NEAR,
    )}&limit=12&fields=fsq_id,name,categories,location,rating,price,hours`;

    const res = await fetch(url, {
      headers: { Authorization: this.apiKey, accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Foursquare search failed: ${res.status}`);
    }
    const data = (await res.json()) as { results?: FsqPlace[] };
    const results = data.results ?? [];

    return results.map((p): PlaceResult => {
      const category = p.categories?.[0]?.name ?? 'スポット';
      return {
        id: p.fsq_id,
        name: p.name,
        scene: categoryToScene(category),
        rating: normalizeRating(p.rating),
        category,
        address: p.location?.formatted_address ?? p.location?.address ?? '',
        hours: p.hours?.display ?? '—',
        budget: priceToBudget(p.price),
        suggestedTime: '12:00',
        // 写真は /v3/places/{id}/photos の別エンドポイントで取得予定（TODO）
        photoUrl: null,
      };
    });
  }
}
