import type { SceneKey } from '../../types/models';
import type { PlacesProvider, PlaceResult, SearchOptions } from './types';

/**
 * Foursquare Places API (v3) を使った実プロバイダ。
 * Google 以外の選択として採用。写真・評価・営業時間・価格帯・住所が無料枠で揃う。
 * APIキーは EXPO_PUBLIC_FOURSQUARE_API_KEY から渡す。
 *
 * 地域は search(query, { near | ll }) で指定する。指定が無ければ DEFAULT_NEAR。
 * 写真は /v3/places/{id}/photos から取得して photoUrl に詰める。
 */
const SEARCH_ENDPOINT = 'https://api.foursquare.com/v3/places/search';
const placePhotosEndpoint = (id: string) => `https://api.foursquare.com/v3/places/${id}/photos`;
const DEFAULT_NEAR = 'Kyoto, Japan';
/** 取得する写真サイズ（prefix と suffix の間に挿入） */
const PHOTO_SIZE = '400x400';

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

interface FsqPhoto {
  prefix: string;
  suffix: string;
}

export class FoursquarePlacesProvider implements PlacesProvider {
  readonly id = 'foursquare';
  constructor(private apiKey: string) {}

  private get headers() {
    return { Authorization: this.apiKey, accept: 'application/json' };
  }

  async search(query: string, options?: SearchOptions): Promise<PlaceResult[]> {
    const params = new URLSearchParams({
      query,
      limit: '12',
      fields: 'fsq_id,name,categories,location,rating,price,hours',
    });
    // 地域指定: ll（座標）優先、なければ near（地名）
    if (options?.ll) params.set('ll', options.ll);
    else params.set('near', options?.near?.trim() || DEFAULT_NEAR);

    const res = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`, { headers: this.headers });
    if (!res.ok) {
      throw new Error(`Foursquare search failed: ${res.status}`);
    }
    const data = (await res.json()) as { results?: FsqPlace[] };
    const results = data.results ?? [];

    const mapped = results.map((p): PlaceResult => {
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
        photoUrl: null,
      };
    });

    // 各スポットの写真を並行取得して photoUrl を埋める（失敗時は SVG フォールバック）
    await Promise.all(
      mapped.map(async (m) => {
        m.photoUrl = await this.fetchPhoto(m.id);
      }),
    );

    return mapped;
  }

  /** スポットの代表写真 URL を 1 枚取得する。 */
  private async fetchPhoto(fsqId: string): Promise<string | null> {
    try {
      const res = await fetch(`${placePhotosEndpoint(fsqId)}?limit=1`, { headers: this.headers });
      if (!res.ok) return null;
      const photos = (await res.json()) as FsqPhoto[];
      const photo = photos?.[0];
      if (!photo?.prefix || !photo?.suffix) return null;
      return `${photo.prefix}${PHOTO_SIZE}${photo.suffix}`;
    } catch {
      return null;
    }
  }
}
