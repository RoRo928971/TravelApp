import React from 'react';
import { Image, View, type DimensionValue } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { sceneXml } from '../data/scenes';
import type { SceneKey } from '../types/models';

interface Props {
  scene: SceneKey;
  width: DimensionValue;
  height: number;
  radius?: number;
  /** 実 API の写真があればそれを優先表示する */
  photoUrl?: string | null;
}

/**
 * 風景サムネイル。写真 URL があれば画像を、無ければ和テイストの SVG を描画する。
 */
export function SceneThumb({ scene, width, height, radius = 0, photoUrl }: Props) {
  return (
    <View style={{ width, height, borderRadius: radius, overflow: 'hidden' }}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={{ width, height }} resizeMode="cover" />
      ) : (
        <SvgXml xml={sceneXml(scene)} width={width as number | string} height={height} />
      )}
    </View>
  );
}
