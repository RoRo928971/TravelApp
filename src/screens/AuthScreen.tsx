import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { supabase } from '../lib/supabase';

/**
 * クラウドモードのサインイン画面（マジックリンク）。
 * Supabase が設定されていて未ログインのときだけ表示される。
 */
export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    if (!supabase || !email.trim()) return;
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <View style={styles.root}>
      <Text style={styles.brand}>旅のしおり</Text>
      <Text style={styles.sub}>ふたりで綴る旅のプランナー</Text>

      {sent ? (
        <Text style={styles.notice}>{email} にログインリンクを送りました。{'\n'}メールを確認してください。</Text>
      ) : (
        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="メールアドレス"
            placeholderTextColor={colors.inkSoft}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <Pressable style={styles.button} onPress={signIn}>
            <Text style={styles.buttonText}>ログインリンクを送る</Text>
          </Pressable>
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.pine, alignItems: 'center', justifyContent: 'center', padding: 28 },
  brand: { fontFamily: fonts.minchoExtraBold, fontSize: 34, color: colors.cream, letterSpacing: 4 },
  sub: { fontFamily: fonts.gothic, fontSize: 13, color: colors.goldText, marginTop: 8, marginBottom: 36 },
  form: { width: '100%', maxWidth: 360, gap: 12 },
  input: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: fonts.gothic,
    color: colors.ink,
  },
  button: { backgroundColor: colors.persimmon, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 15, fontFamily: fonts.gothicBold },
  notice: { color: colors.cream, fontFamily: fonts.gothic, textAlign: 'center', lineHeight: 22 },
  error: { color: '#FFD7C7', fontFamily: fonts.gothic, fontSize: 12, textAlign: 'center' },
});
