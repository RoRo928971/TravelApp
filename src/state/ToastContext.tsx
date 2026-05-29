import React, { createContext, useCallback, useContext, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, roleColor } from '../theme';
import type { MemberRole } from '../types/models';
import { makeId } from '../lib/id';

type ToastWho = MemberRole | 'sys';
interface ToastItem {
  id: string;
  message: string;
  who: ToastWho;
}

interface ToastContextValue {
  showToast: (message: string, who?: ToastWho) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, who: ToastWho = 'partner') => {
    const id = makeId('toast');
    setItems((prev) => [...prev, { id, message, who }]);
    const ttl = who === 'sys' ? 1100 : 3200;
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), ttl);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View pointerEvents="none" style={styles.host}>
        {items.map((t) => (
          <View key={t.id} style={styles.toast}>
            <View style={[styles.dot, { backgroundColor: dotColor(t.who) }]}>
              <Text style={styles.dotText}>{dotLabel(t.who)}</Text>
            </View>
            <Text style={styles.text}>{t.message}</Text>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function dotColor(who: ToastWho): string {
  if (who === 'me') return roleColor.me;
  if (who === 'partner') return roleColor.partner;
  return colors.gold;
}
function dotLabel(who: ToastWho): string {
  if (who === 'me') return 'ハ';
  if (who === 'partner') return 'ユ';
  return '📍';
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.ink,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    maxWidth: '100%',
  },
  dot: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  dotText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  text: { color: colors.cream, fontSize: 12.5, fontFamily: fonts.gothic, flexShrink: 1 },
});
