import { config, hasFoursquare } from '../../config';
import { FoursquarePlacesProvider } from './foursquare';
import { MockPlacesProvider } from './mock';
import type { PlacesProvider } from './types';

export type { PlacesProvider, PlaceResult } from './types';

let cached: PlacesProvider | null = null;

/**
 * 環境に応じて場所検索プロバイダを返す。
 * Foursquare のキーがあれば実 API、なければモック DB。
 */
export function getPlacesProvider(): PlacesProvider {
  if (cached) return cached;
  cached = hasFoursquare
    ? new FoursquarePlacesProvider(config.foursquareApiKey)
    : new MockPlacesProvider();
  return cached;
}
