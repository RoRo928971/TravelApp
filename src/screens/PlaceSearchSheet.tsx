import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fonts, radius } from '../theme';
import { getPlacesProvider, type PlaceResult } from '../providers/places';
import { useTrip } from '../state/TripContext';
import { useToast } from '../state/ToastContext';
import { SceneThumb } from '../components/SceneThumb';
import { Icon } from '../components/Icon';

interface Props {
  visible: boolean;
  dayId: string | null;
  onClose: () => void;
}

/** 場所検索シート。地図サービス（Foursquare / モック）から候補を取得して行程に追加する。 */
export function PlaceSearchSheet({ visible, dayId, onClose }: Props) {
  const { addStopFromPlace } = useTrip();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      return;
    }
  }, [visible]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const r = await getPlacesProvider().search(query);
        if (active) setResults(r);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [query, visible]);

  const onSelect = (p: PlaceResult) => {
    if (!dayId) return;
    onClose();
    showToast('地図から写真と情報を取得中…', 'sys');
    setTimeout(() => {
      addStopFromPlace(dayId, p);
      showToast(`「${p.name}」を追加しました`, 'me');
    }, 600);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.grab} />
        <View style={styles.head}>
          <Text style={styles.title}>場所を追加</Text>
          <Pressable style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.searchbar}>
          <Icon name="search" size={17} color={colors.persimmon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="店名・スポットを検索（例: 伏見、カフェ）"
            placeholderTextColor={colors.inkSoft}
            style={styles.input}
            autoFocus
          />
        </View>
        <Text style={styles.hint}>📍 地図サービスから写真とお店情報を自動取得します</Text>

        <View style={styles.results}>
          {loading ? (
            <ActivityIndicator color={colors.pine} style={{ marginTop: 24 }} />
          ) : results.length === 0 ? (
            <Text style={styles.empty}>該当する場所がありません</Text>
          ) : (
            results.map((p) => (
              <Pressable key={p.id} style={styles.result} onPress={() => onSelect(p)}>
                <SceneThumb scene={p.scene} width={46} height={46} radius={11} photoUrl={p.photoUrl} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rName}>{p.name}</Text>
                  <Text style={styles.rMeta}>
                    <Text style={styles.rStar}>★ {p.rating}</Text> · {p.category} · {p.address}
                  </Text>
                </View>
                <View style={styles.add}>
                  <Text style={styles.addText}>＋</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,18,16,0.42)' },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: '84%',
  },
  grab: { width: 40, height: 4, borderRadius: 4, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontFamily: fonts.minchoBold, fontSize: 17, color: colors.ink },
  close: { backgroundColor: colors.paper2, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.inkSoft, fontSize: 13 },
  searchbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  input: { flex: 1, fontFamily: fonts.gothic, fontSize: 14, color: colors.ink, padding: 0 },
  hint: { fontSize: 11, color: colors.inkSoft, marginTop: 10, marginBottom: 4, fontFamily: fonts.gothic },
  results: { marginTop: 4 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  rName: { fontWeight: '700', fontSize: 14, fontFamily: fonts.gothicBold, color: colors.ink },
  rMeta: { fontSize: 11, color: colors.inkSoft, marginTop: 2, fontFamily: fonts.gothic },
  rStar: { color: colors.gold, fontFamily: fonts.serifSemiBold },
  add: { backgroundColor: colors.pine, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  addText: { color: colors.cream, fontSize: 17 },
  empty: { textAlign: 'center', color: colors.inkSoft, fontSize: 13, padding: 24, fontFamily: fonts.gothic },
});
