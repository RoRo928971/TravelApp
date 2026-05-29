import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import type { MemberRole } from '../types/models';

interface Props {
  role: MemberRole;
  active?: boolean;
  showOnlineDot?: boolean;
}

const LABEL: Record<MemberRole, string> = { me: 'ハ', partner: 'ユ' };

/** 二人のアバター。あなた=深緑地のクリーム、相手=柿色。 */
export function Avatar({ role, active, showOnlineDot }: Props) {
  const isMe = role === 'me';
  return (
    <View
      style={[
        styles.av,
        isMe ? styles.me : styles.partner,
        active && (isMe ? styles.activeMe : styles.activePartner),
      ]}
    >
      <Text style={[styles.label, { color: isMe ? colors.pine : '#fff' }]}>{LABEL[role]}</Text>
      {showOnlineDot && <View style={styles.online} />}
    </View>
  );
}

const styles = StyleSheet.create({
  av: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.pine,
  },
  me: { backgroundColor: colors.goldText },
  partner: { backgroundColor: colors.persimmon, marginLeft: -10 },
  activeMe: { borderColor: colors.goldText, borderWidth: 3 },
  activePartner: { borderColor: colors.persimmon, borderWidth: 3 },
  label: { fontSize: 14, fontWeight: '700' },
  online: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.pine,
  },
});
