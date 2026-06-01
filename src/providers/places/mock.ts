import type { PlacesProvider, PlaceResult, SearchOptions } from './types';

/** モックの場所DB（承認済みモックの placeDB を移植） */
const DB: PlaceResult[] = [
  { id: 'fushimi', name: '伏見稲荷大社', scene: 'torii', suggestedTime: '10:00', hours: '終日参拝可', budget: '無料', address: '伏見区 深草', category: '寺社', rating: '4.7' },
  { id: 'yasaka', name: '八坂神社', scene: 'gion', suggestedTime: '17:30', hours: '終日参拝可', budget: '無料', address: '東山区 祇園町', category: '寺社', rating: '4.5' },
  { id: 'sannei', name: '二年坂・三年坂', scene: 'kiyomizu', suggestedTime: '13:30', hours: '散策自由', budget: '無料', address: '東山区', category: '散策', rating: '4.4' },
  { id: 'arabica', name: '％アラビカ 京都 東山', scene: 'cafe', suggestedTime: '15:30', hours: '8:00–18:00', budget: '¥600〜', address: '東山区 星野町', category: 'カフェ', rating: '4.3' },
  { id: 'nanzenji', name: '南禅寺', scene: 'kiyomizu', suggestedTime: '11:00', hours: '8:40–17:00', budget: '¥600', address: '左京区 南禅寺', category: '寺社', rating: '4.5' },
  { id: 'byodoin', name: '平等院 鳳凰堂', scene: 'kinkaku', suggestedTime: '14:00', hours: '8:30–17:30', budget: '¥600', address: '宇治市 宇治蓮華', category: '寺社', rating: '4.6' },
  { id: 'arashiyama-onsen', name: '嵐山温泉 足湯', scene: 'onsen', suggestedTime: '17:30', hours: '9:00–18:00', budget: '¥200', address: '右京区 嵯峨天龍寺', category: '温泉', rating: '4.2' },
];

export class MockPlacesProvider implements PlacesProvider {
  readonly id = 'mock';

  // モックは地域指定(options)を無視する
  async search(query: string, _options?: SearchOptions): Promise<PlaceResult[]> {
    const q = query.trim();
    // 地図サービス風に少しだけ遅延させる
    await new Promise((r) => setTimeout(r, 400));
    if (!q) return DB;
    return DB.filter(
      (p) => p.name.includes(q) || p.category.includes(q) || p.address.includes(q),
    );
  }
}
