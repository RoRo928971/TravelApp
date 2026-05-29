import * as Linking from 'expo-linking';

/**
 * 招待ディープリンクの生成と解析。
 * 例: tabinoshiori://invite?code=ab12cd34ef （Expo Go では exp://.../--/invite?code=...）
 */
export function buildInviteUrl(code: string): string {
  return Linking.createURL('invite', { queryParams: { code } });
}

/** URL から招待コードを取り出す。招待リンクでなければ null。 */
export function parseInviteCode(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = Linking.parse(url);
    const code = parsed.queryParams?.code;
    const isInvite = parsed.path?.includes('invite') || parsed.hostname === 'invite';
    if (isInvite && typeof code === 'string' && code.length > 0) return code;
  } catch {
    // ignore malformed urls
  }
  return null;
}
