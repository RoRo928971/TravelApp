/**
 * 「旅のしおり」のデザイントークン。
 * 承認済みモック（mock/index.html）の :root 変数と一対一で対応させている。
 */
export const colors = {
  paper: '#FAF4E9',
  paper2: '#F3EAD8',
  card: '#FFFDF8',
  ink: '#2B2620',
  inkSoft: '#7A7063',
  line: '#E6DCC8',
  pine: '#16453C', // あなた（深緑）
  pine2: '#1F5C50',
  persimmon: '#D9603B', // 相手（柿色）
  persimmonSoft: '#FBEAE2',
  gold: '#C99A3F',
  cream: '#F6EFE0',
  goldText: '#EBD9B6',
  online: '#7BD389',
} as const;

/** 二人を色分けするための役割→色 */
export const roleColor = {
  me: colors.pine,
  partner: colors.persimmon,
} as const;

/**
 * フォントファミリ名。@expo-google-fonts のエクスポート名と一致させ、
 * App.tsx の useFonts に登録したキーをそのまま fontFamily に使う。
 */
export const fonts = {
  // 明朝（見出し・地名）
  minchoMedium: 'ShipporiMincho_500Medium',
  minchoSemiBold: 'ShipporiMincho_600SemiBold',
  minchoBold: 'ShipporiMincho_700Bold',
  minchoExtraBold: 'ShipporiMincho_800ExtraBold',
  // ゴシック（本文・UI）
  gothic: 'ZenKakuGothicNew_400Regular',
  gothicMedium: 'ZenKakuGothicNew_500Medium',
  gothicBold: 'ZenKakuGothicNew_700Bold',
  // 欧文セリフ（時刻・ラベルの差し色）
  serif: 'Fraunces_400Regular',
  serifSemiBold: 'Fraunces_600SemiBold',
  serifItalic: 'Fraunces_500Medium_Italic',
  serifItalicSemiBold: 'Fraunces_600SemiBold_Italic',
} as const;

export const radius = { sm: 7, md: 13, lg: 16, xl: 24, pill: 30 } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 18, xl: 22 } as const;
