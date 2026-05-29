import React from 'react';
import { SvgXml } from 'react-native-svg';

export type IconName =
  | 'clock'
  | 'yen'
  | 'pin'
  | 'tag'
  | 'map'
  | 'swap'
  | 'trash'
  | 'chevron'
  | 'search'
  | 'userplus';

const PATHS: Record<IconName, string> = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  yen: '<path d="M7 4l5 7 5-7M12 11v9M8 15h8M8 18h8"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  tag: '<path d="M3 12l9-9 9 9-9 9z"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  swap: '<path d="M7 4 L3 8 L7 12"/><path d="M3 8 H21"/><path d="M17 12 L21 16 L17 20"/><path d="M21 16 H3"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
  userplus: '<path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
};

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 16, color = '#000', strokeWidth = 2 }: Props) {
  const xml = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${PATHS[name]}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} />;
}
