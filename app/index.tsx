import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { STORAGE_KEYS } from '@/constants/storage';

export default function Index() {
  const [targetRoute, setTargetRoute] = useState<'/onboarding' | '/(tabs)' | null>(null);

  useEffect(() => {
    const resolveInitialRoute = async () => {
      try {
        const firstLaunchValue = await AsyncStorage.getItem(STORAGE_KEYS.firstLaunch);
        setTargetRoute(firstLaunchValue === 'false' ? '/(tabs)' : '/onboarding');
      } catch (error) {
        console.error('Failed to read first launch flag', error);
        setTargetRoute('/onboarding');
      }
    };

    resolveInitialRoute();
  }, []);

  if (!targetRoute) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.loaderText}>Завантажуємо застосунок...</Text>
      </View>
    );
  }

  return <Redirect href={targetRoute} />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  loaderText: {
    color: '#475569',
    fontSize: 16,
  },
});
