import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors, fonts, radius } from '../theme';
import { useTrip } from '../state/TripContext';
import { useToast } from '../state/ToastContext';
import { Avatar } from '../components/Avatar';
import { ItineraryView } from './ItineraryView';
import { ChecklistView } from './ChecklistView';

type Tab = 'plan' | 'pack';

const RESET_ICON =
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="' +
  colors.goldText +
  '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';

/** アプリ本体。ヘッダー＋タブ＋各ビュー。承認済みモックの構成を踏襲。 */
export function MainScreen() {
  const { trip, acting, toggleActing, presence, setTitle, reset } = useTrip();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('plan');
  const [title, setLocalTitle] = useState(trip?.title ?? '');

  if (!trip) return null;

  const planCount = trip.days.reduce((n, d) => n + d.stops.length, 0);
  const done = trip.checklist.filter((c) => c.done).length;
  const packCount = `${done}/${trip.checklist.length}`;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.brandrow}>
            <View>
              <Text style={styles.brand}>旅のしおり</Text>
              <Text style={styles.brandSmall}>FUTARI TABI · KYOTO</Text>
            </View>
            <View style={styles.headtools}>
              <Pressable
                style={styles.resetBtn}
                onPress={() => {
                  reset();
                  showToast('最初の状態に戻しました', 'sys');
                }}
              >
                <SvgXml xml={RESET_ICON} width={15} height={15} />
              </Pressable>
              <Pressable
                style={styles.avatars}
                onPress={() => {
                  toggleActing();
                  showToast(`${acting === 'me' ? 'ユカリ' : 'ハル'}として操作中`, acting === 'me' ? 'partner' : 'me');
                }}
              >
                <Avatar role="me" active={acting === 'me'} />
                <Avatar role="partner" active={acting === 'partner'} showOnlineDot />
              </Pressable>
            </View>
          </View>

          <TextInput
            value={title || trip.title}
            onChangeText={setLocalTitle}
            onEndEditing={() => setTitle((title || trip.title).trim() || trip.title)}
            style={styles.title}
          />
          <View style={styles.meta}>
            <Text style={styles.metaText}>{trip.dateRange}</Text>
            <Text style={styles.metaText}>{trip.nights}</Text>
          </View>
          <Text style={styles.acting}>
            いま操作中： <Text style={styles.actingName}>{acting === 'me' ? 'ハル' : 'ユカリ'}</Text>（アバターで交代）
          </Text>
          <View style={styles.presence}>
            <View style={styles.pulse} />
            <Text style={styles.presenceText}>{presence}</Text>
          </View>
        </View>

        {/* タブ */}
        <View style={styles.tabs}>
          <TabButton label="行程" badge={String(planCount)} active={tab === 'plan'} onPress={() => setTab('plan')} />
          <TabButton label="持ち物・やること" badge={packCount} active={tab === 'pack'} onPress={() => setTab('pack')} />
        </View>

        {/* 内容 */}
        <View style={styles.content}>{tab === 'plan' ? <ItineraryView /> : <ChecklistView />}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TabButton({
  label,
  badge,
  active,
  onPress,
}: {
  label: string;
  badge: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.tab} onPress={onPress}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      <View style={[styles.badge, active && styles.badgeActive]}>
        <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{badge}</Text>
      </View>
      {active && <View style={styles.inkBar} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  scroll: { paddingBottom: 40 },
  header: { backgroundColor: colors.pine, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 26 },
  brandrow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: fonts.minchoBold, fontSize: 15, letterSpacing: 3, color: colors.goldText },
  brandSmall: { fontFamily: fonts.serifItalic, fontSize: 10, letterSpacing: 1.8, color: colors.goldText, opacity: 0.7, marginTop: 2 },
  headtools: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resetBtn: { backgroundColor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatars: { flexDirection: 'row', alignItems: 'center' },
  title: { fontFamily: fonts.minchoExtraBold, fontSize: 30, color: colors.cream, marginTop: 18, padding: 0 },
  meta: { flexDirection: 'row', gap: 14, marginTop: 10 },
  metaText: { fontSize: 13, color: '#F6EFE0', fontFamily: fonts.serifSemiBold },
  acting: { marginTop: 6, fontSize: 11, color: '#D9CBA9', fontFamily: fonts.gothic },
  actingName: { color: colors.cream, fontFamily: fonts.gothicBold },
  presence: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.persimmon },
  presenceText: { fontSize: 12, color: colors.goldText, fontFamily: fonts.gothic },
  tabs: { flexDirection: 'row', gap: 6, paddingHorizontal: 18, paddingTop: 14, backgroundColor: colors.paper },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, paddingVertical: 12, paddingBottom: 14 },
  tabLabel: { fontFamily: fonts.gothicBold, fontSize: 14, color: colors.inkSoft },
  tabLabelActive: { color: colors.pine },
  badge: { backgroundColor: colors.paper2, borderRadius: 12, paddingVertical: 1, paddingHorizontal: 8 },
  badgeActive: { backgroundColor: colors.pine },
  badgeText: { fontFamily: fonts.serif, fontSize: 11, color: colors.inkSoft },
  badgeTextActive: { color: colors.cream },
  inkBar: { position: 'absolute', bottom: 0, width: 46, height: 3, borderRadius: 3, backgroundColor: colors.persimmon },
  content: { paddingHorizontal: 18, paddingBottom: 30 },
});
