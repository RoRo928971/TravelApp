import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { useTrip } from '../state/TripContext';
import { ChecklistRow } from '../components/ChecklistRow';
import type { ChecklistItem } from '../types/models';

/** 持ち物・やること タブ。 */
export function ChecklistView() {
  const { trip } = useTrip();
  if (!trip) return null;
  const common = trip.checklist.filter((c) => c.category === 'common');
  const todo = trip.checklist.filter((c) => c.category === 'todo');

  return (
    <View>
      <Group title="持ち物" tag="共通" category="common" items={common} placeholder="持ち物を追加（例：充電器）" />
      <Group title="やること" tag="予約・準備" category="todo" items={todo} placeholder="やることを追加（例：宿の予約）" />
    </View>
  );
}

function Group({
  title,
  tag,
  category,
  items,
  placeholder,
}: {
  title: string;
  tag: string;
  category: 'common' | 'todo';
  items: ChecklistItem[];
  placeholder: string;
}) {
  const { addChecklistItem } = useTrip();
  const [text, setText] = useState('');

  const submit = () => {
    addChecklistItem(category, text);
    setText('');
  };

  return (
    <View style={styles.grp}>
      <View style={styles.grpTitle}>
        <Text style={styles.grpTitleText}>{title}</Text>
        <View style={styles.who}>
          <Text style={styles.whoText}>{tag}</Text>
        </View>
      </View>

      {items.map((item) => (
        <ChecklistRow key={item.id} item={item} />
      ))}

      <View style={styles.additem}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={submit}
          placeholder={placeholder}
          placeholderTextColor={colors.inkSoft}
          style={styles.input}
          returnKeyType="done"
        />
        <Pressable style={styles.addBtn} onPress={submit}>
          <Text style={styles.addBtnText}>＋</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grp: { marginTop: 20 },
  grpTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  grpTitleText: { fontFamily: fonts.minchoBold, fontSize: 15, color: colors.ink },
  who: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 1, paddingHorizontal: 9 },
  whoText: { fontSize: 10.5, fontWeight: '700', color: '#fff', fontFamily: fonts.gothicBold },
  additem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  input: { flex: 1, fontFamily: fonts.gothicMedium, fontSize: 14, color: colors.ink, padding: 0 },
  addBtn: { backgroundColor: colors.pine, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: colors.cream, fontSize: 16 },
});
