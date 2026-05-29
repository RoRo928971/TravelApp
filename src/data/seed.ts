import type { Trip } from '../types/models';

/** ローカルモードの初期データ。承認済みモックの内容をそのまま再現する。 */
export function seedTrip(): Trip {
  return {
    id: 'local-trip',
    title: '京都 ふたり旅',
    dateRange: '3.14 金 — 3.16 日',
    nights: '2泊3日',
    days: [
      {
        id: 'day1',
        label: 'Day 1',
        date: '3月14日',
        sub: '金 · 京都着',
        stops: [
          { id: 'sta', dayId: 'day1', time: '10:30', place: '京都駅 到着', note: 'のぞみ214号 / ロッカーに荷物', by: 'me', scene: 'station', info: { hours: '始発〜終電', budget: 'ロッカー ¥700', addr: '京都市下京区 烏丸通', tag: '駅・拠点', rate: '—' } },
          { id: 'mkt', dayId: 'day1', time: '11:30', place: '錦市場でランチ', note: '食べ歩き・だし巻き卵', by: 'partner', scene: 'market', info: { hours: '9:30–18:00', budget: '食べ歩き ¥1,500', addr: '中京区 錦小路通', tag: 'グルメ', rate: '4.4' } },
          { id: 'kym', dayId: 'day1', time: '14:00', place: '清水寺', note: '産寧坂を散策しながら', by: 'me', scene: 'kiyomizu', info: { hours: '6:00–18:00', budget: '拝観料 ¥400', addr: '東山区 清水1丁目', tag: '寺社', rate: '4.6' } },
          { id: 'gion', dayId: 'day1', time: '18:30', place: '祇園で夕食', note: 'お店を検討中…', by: 'partner', scene: 'gion', editingBy: 'partner', info: { hours: '—', budget: '—', addr: '東山区 祇園', tag: '検討中', rate: '—' } },
        ],
      },
      {
        id: 'day2',
        label: 'Day 2',
        date: '3月15日',
        sub: '土 · 嵐山',
        stops: [
          { id: 'bmb', dayId: 'day2', time: '09:00', place: '嵐山・竹林の小径', note: '早めに行って人混みを回避', by: 'me', scene: 'bamboo', info: { hours: '終日', budget: '無料', addr: '右京区 嵯峨', tag: '絶景', rate: '4.5' } },
          { id: 'tof', dayId: 'day2', time: '12:00', place: '湯豆腐ランチ', note: '渡月橋のそば', by: 'partner', scene: 'tofu', info: { hours: '11:00–17:00', budget: '¥3,000〜', addr: '右京区 嵯峨天龍寺', tag: 'グルメ', rate: '4.3' } },
          { id: 'kin', dayId: 'day2', time: '15:00', place: '金閣寺', note: '夕方の光がきれい', by: 'me', scene: 'kinkaku', info: { hours: '9:00–17:00', budget: '拝観料 ¥500', addr: '北区 金閣寺町', tag: '寺社', rate: '4.6' } },
        ],
      },
    ],
    checklist: [
      { id: 'c1', category: 'common', text: 'モバイルバッテリー', owner: 'partner', done: false },
      { id: 'c2', category: 'common', text: '常備薬', owner: 'me', done: false },
      { id: 'c3', category: 'common', text: 'ガイドブック', owner: 'partner', done: false },
      { id: 'c4', category: 'common', text: '折りたたみ傘', owner: 'me', done: false },
      { id: 'c5', category: 'common', text: 'カメラ', owner: 'me', done: true },
      { id: 't1', category: 'todo', text: '新幹線チケットを予約', owner: 'me', done: true },
      { id: 't2', category: 'todo', text: 'ホテルを予約', owner: 'partner', done: true },
      { id: 't3', category: 'todo', text: 'レンタル着物を予約', owner: 'partner', done: false },
      { id: 't4', category: 'todo', text: 'お土産リストを作る', owner: 'me', done: false },
    ],
  };
}
