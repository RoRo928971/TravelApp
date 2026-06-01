import 'react-native-url-polyfill/auto';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  ShipporiMincho_500Medium,
  ShipporiMincho_600SemiBold,
  ShipporiMincho_700Bold,
  ShipporiMincho_800ExtraBold,
} from '@expo-google-fonts/shippori-mincho';
import {
  ZenKakuGothicNew_400Regular,
  ZenKakuGothicNew_500Medium,
  ZenKakuGothicNew_700Bold,
} from '@expo-google-fonts/zen-kaku-gothic-new';
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_500Medium_Italic,
  Fraunces_600SemiBold_Italic,
} from '@expo-google-fonts/fraunces';

import { colors } from './src/theme';
import { useAuth } from './src/hooks/useAuth';
import { ToastProvider } from './src/state/ToastContext';
import { TripProvider } from './src/state/TripContext';
import { PresenceProvider } from './src/state/PresenceContext';
import { MainScreen } from './src/screens/MainScreen';
import { AuthScreen } from './src/screens/AuthScreen';

function Gate() {
  const { cloud, loading, session } = useAuth();

  if (loading) return <Splash />;
  // クラウドモードで未ログインなら認証画面。ローカルモードは素通り。
  if (cloud && !session) return <AuthScreen />;

  return (
    <ToastProvider>
      <TripProvider>
        <PresenceProvider>
          <MainScreen />
        </PresenceProvider>
      </TripProvider>
    </ToastProvider>
  );
}

function Splash() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator color={colors.cream} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ShipporiMincho_500Medium,
    ShipporiMincho_600SemiBold,
    ShipporiMincho_700Bold,
    ShipporiMincho_800ExtraBold,
    ZenKakuGothicNew_400Regular,
    ZenKakuGothicNew_500Medium,
    ZenKakuGothicNew_700Bold,
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_500Medium_Italic,
    Fraunces_600SemiBold_Italic,
  });

  if (!fontsLoaded) return <Splash />;

  return (
    <>
      <StatusBar style="light" />
      <Gate />
    </>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.pine, alignItems: 'center', justifyContent: 'center' },
});
