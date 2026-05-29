/** 依存を増やさない簡易 ID 生成（衝突確率は十分低い）。 */
export function makeId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
