import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { colors, fonts, radius, roleColor } from '../theme';
import type { MemberRole, Stop } from '../types/models';
import { useTrip } from '../state/TripContext';
import { useToast } from '../state/ToastContext';
import { SceneThumb } from './SceneThumb';
import { Icon } from './Icon';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NAME: Record<MemberRole, string> = { me: 'ハル', partner: 'ユカリ' };
const INI: Record<MemberRole, string> = { me: 'ハ', partner: 'ユ' };

export function StopCard({ stop, last }: { stop: Stop; last: boolean }) {
  const { acting, updateStop, deleteStop, toggleStopOwner, setPresence, idlePresence } = useTrip();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(stop.time);
  const [place, setPlace] = useState(stop.place);
  const [note, setNote] = useState(stop.note);
  const [editing, setEditing] = useState(false);

  const ownerColor = roleColor[stop.by];
  const editFlagColor = roleColor[acting];

  const beginEdit = () => {
    setEditing(true);
    setPresence(`${NAME[acting]}さんが編集中…`);
  };
  const endEdit = (patch: Partial<Stop>) => {
    setEditing(false);
    idlePresence();
    updateStop({ ...stop, ...patch });
  };

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  };

  return (
    <View style={styles.stop}>
      {/* 時刻 + レール */}
      <TextInput
        value={time}
        onChangeText={setTime}
        onFocus={beginEdit}
        onEndEditing={() => endEdit({ time })}
        style={styles.time}
        maxLength={5}
      />
      <View style={styles.rail}>
        <View style={[styles.node, { borderColor: ownerColor }]} />
        {!last && <View style={styles.line} />}
      </View>

      {/* カード */}
      <View style={[styles.card, { borderLeftColor: ownerColor, borderLeftWidth: 4 }, editing && styles.cardEditing]}>
        {editing && (
          <View style={[styles.editflag, { backgroundColor: editFlagColor }]}>
            <Text style={styles.editflagText}>{NAME[acting]} 編集中</Text>
          </View>
        )}

        <Pressable style={styles.cardTop} onPress={toggle}>
          <SceneThumb scene={stop.scene} width={54} height={54} radius={12} photoUrl={stop.info.photoUrl} />
          <View style={styles.body}>
            <TextInput
              value={place}
              onChangeText={setPlace}
              onFocus={beginEdit}
              onEndEditing={() => endEdit({ place })}
              style={styles.place}
            />
            <TextInput
              value={note}
              onChangeText={setNote}
              onFocus={beginEdit}
              onEndEditing={() => endEdit({ note })}
              placeholder="メモを書く…"
              placeholderTextColor={colors.inkSoft}
              style={styles.note}
            />
            <View style={styles.credit}>
              <View style={[styles.chip, { backgroundColor: ownerColor }]}>
                <Text style={styles.chipText}>{INI[stop.by]}</Text>
              </View>
              <Text style={styles.creditText}>{NAME[stop.by]}が担当</Text>
            </View>
          </View>
          <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
            <Icon name="chevron" size={16} color={colors.inkSoft} strokeWidth={2.2} />
          </View>
        </Pressable>

        {open && (
          <View style={styles.detail}>
            <SceneThumb scene={stop.scene} width="100%" height={118} photoUrl={stop.info.photoUrl} />
            <View style={styles.info}>
              <InfoRow icon="clock" k="営業時間" v={stop.info.hours} />
              <InfoRow icon="yen" k="予算" v={stop.info.budget} />
              <InfoRow icon="tag" k="カテゴリ" v={stop.info.tag} />
              <InfoRow icon="pin" k="住所" v={stop.info.addr} />
            </View>
            <View style={styles.actions}>
              <Action icon="map" label="地図" onPress={() => showToast(`「${stop.place}」を地図で開きます（モック）`, 'sys')} />
              <Action
                icon="swap"
                label="担当交代"
                onPress={() => {
                  toggleStopOwner(stop);
                  showToast(`「${stop.place}」の担当を交代`, acting);
                }}
              />
              <Action
                icon="trash"
                label="削除"
                danger
                onPress={() => {
                  deleteStop(stop.id);
                  showToast(`「${stop.place}」を削除しました`, acting);
                }}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

function InfoRow({ icon, k, v }: { icon: 'clock' | 'yen' | 'tag' | 'pin'; k: string; v: string }) {
  return (
    <View style={styles.inforow}>
      <Icon name={icon} size={16} color={colors.persimmon} />
      <Text style={styles.infoKey}>{k}</Text>
      <Text style={styles.infoVal}>{v}</Text>
    </View>
  );
}

function Action({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: 'map' | 'swap' | 'trash';
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const c = danger ? colors.persimmon : colors.pine;
  return (
    <Pressable style={styles.act} onPress={onPress}>
      <Icon name={icon} size={14} color={c} />
      <Text style={[styles.actText, { color: c }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stop: { flexDirection: 'row', gap: 12, paddingBottom: 14 },
  time: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 14,
    color: colors.ink,
    width: 44,
    paddingTop: 12,
    textAlign: 'right',
  },
  rail: { width: 14, alignItems: 'center' },
  node: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.paper,
    borderWidth: 2.5,
    marginTop: 17,
    zIndex: 2,
  },
  line: { position: 'absolute', top: 0, bottom: -2, width: 2, backgroundColor: colors.line },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardEditing: { borderColor: colors.persimmon },
  editflag: {
    position: 'absolute',
    top: 0,
    right: 12,
    paddingVertical: 2,
    paddingHorizontal: 9,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 5,
  },
  editflagText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardTop: { flexDirection: 'row', gap: 12, padding: 11, alignItems: 'center' },
  body: { flex: 1 },
  place: { fontWeight: '700', fontSize: 15, color: colors.ink, fontFamily: fonts.gothicBold, padding: 0 },
  note: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2, fontFamily: fonts.gothic, padding: 0 },
  credit: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  chip: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chipText: { color: '#fff', fontSize: 8.5, fontWeight: '700' },
  creditText: { fontSize: 10.5, color: colors.inkSoft, fontFamily: fonts.gothic },
  detail: { borderTopWidth: 1, borderTopColor: colors.line },
  info: { padding: 14, paddingBottom: 6 },
  inforow: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', marginBottom: 9 },
  infoKey: { color: colors.inkSoft, width: 56, fontSize: 12.5, fontFamily: fonts.gothic },
  infoVal: { fontWeight: '500', fontSize: 12.5, flex: 1, fontFamily: fonts.gothicMedium, color: colors.ink },
  actions: { flexDirection: 'row', gap: 7, paddingHorizontal: 14, paddingBottom: 14 },
  act: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    borderRadius: 11,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  actText: { fontSize: 11.5, fontWeight: '700', fontFamily: fonts.gothicBold },
});
