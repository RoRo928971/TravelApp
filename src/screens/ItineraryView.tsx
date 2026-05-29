import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { useTrip } from '../state/TripContext';
import { StopCard } from '../components/StopCard';
import { PlaceSearchSheet } from './PlaceSearchSheet';

/** 行程タブ：日ごとのタイムライン。 */
export function ItineraryView() {
  const { trip } = useTrip();
  const [sheetDay, setSheetDay] = useState<string | null>(null);

  if (!trip) return null;

  return (
    <View>
      {trip.days.map((day) => (
        <View key={day.id} style={styles.day}>
          <View style={styles.dayHead}>
            <Text style={styles.dayNum}>{day.label}</Text>
            <Text style={styles.dayDate}>{day.date}</Text>
            <Text style={styles.daySub}>{day.sub}</Text>
          </View>

          {day.stops.map((stop, i) => (
            <StopCard key={stop.id} stop={stop} last={i === day.stops.length - 1} />
          ))}

          <Pressable style={styles.addrow} onPress={() => setSheetDay(day.id)}>
            <Text style={styles.plus}>＋</Text>
            <Text style={styles.addText}>予定を追加</Text>
          </Pressable>
        </View>
      ))}

      <PlaceSearchSheet visible={sheetDay !== null} dayId={sheetDay} onClose={() => setSheetDay(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  day: { marginTop: 22 },
  dayHead: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 12 },
  dayNum: { fontFamily: fonts.serifItalicSemiBold, fontSize: 13, color: colors.persimmon },
  dayDate: { fontFamily: fonts.minchoBold, fontSize: 18, color: colors.ink },
  daySub: { fontSize: 11.5, color: colors.inkSoft, marginLeft: 'auto', fontFamily: fonts.gothic },
  addrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 54,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
    borderRadius: radius.md,
  },
  plus: { fontSize: 17, color: colors.inkSoft },
  addText: { fontSize: 13, color: colors.inkSoft, fontFamily: fonts.gothicMedium },
});
