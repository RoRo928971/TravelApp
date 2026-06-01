import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors, fonts, radius, roleColor } from '../theme';
import type { ChecklistItem, MemberRole } from '../types/models';
import { useTrip } from '../state/TripContext';
import { useToast } from '../state/ToastContext';
import { usePresence } from '../state/PresenceContext';

const INI: Record<MemberRole, string> = { me: 'ハ', partner: 'ユ' };
const CHECK = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 13 9 18 20 5"/></svg>';

export function ChecklistRow({ item }: { item: ChecklistItem }) {
  const { acting, updateChecklistItem, deleteChecklistItem, setPresence, idlePresence } = useTrip();
  const { showToast } = useToast();
  const { partnerEditingChecklistId, reportEditing } = usePresence();
  const [text, setText] = useState(item.text);

  const ownerColor = roleColor[item.owner];
  const boxColor = item.done ? ownerColor : 'transparent';
  const remoteEditing = partnerEditingChecklistId === item.id;

  return (
    <View style={[styles.item, remoteEditing && styles.itemEditing]}>
      <Pressable
        onPress={() => updateChecklistItem({ ...item, done: !item.done, owner: !item.done ? acting : item.owner })}
        style={[styles.box, { borderColor: item.done ? ownerColor : colors.inkSoft, backgroundColor: boxColor }]}
      >
        {item.done && <SvgXml xml={CHECK} width={12} height={12} />}
      </Pressable>

      <TextInput
        value={text}
        onChangeText={setText}
        onFocus={() => {
          setPresence(`${item.owner === 'me' ? 'ハル' : 'ユカリ'}さんが編集中…`);
          reportEditing({ kind: 'checklist', id: item.id, label: item.text });
        }}
        onEndEditing={() => {
          const v = text.trim();
          if (v) updateChecklistItem({ ...item, text: v });
          else setText(item.text);
          idlePresence();
          reportEditing(null);
        }}
        style={[styles.label, item.done && styles.labelDone]}
      />

      <Pressable
        onPress={() => {
          deleteChecklistItem(item.id);
          showToast(`「${item.text}」を削除しました`, acting);
        }}
        hitSlop={8}
      >
        <Text style={styles.del}>✕</Text>
      </Pressable>

      <Pressable
        onPress={() => updateChecklistItem({ ...item, owner: item.owner === 'me' ? 'partner' : 'me' })}
        style={[styles.owner, { backgroundColor: ownerColor }]}
      >
        <Text style={styles.ownerText}>{INI[item.owner]}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  itemEditing: { borderColor: colors.persimmon },
  box: { width: 21, height: 21, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 14, fontFamily: fonts.gothicMedium, color: colors.ink, padding: 0 },
  labelDone: { color: colors.inkSoft, textDecorationLine: 'line-through' },
  del: { color: colors.inkSoft, fontSize: 13, paddingHorizontal: 2 },
  owner: { width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  ownerText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
