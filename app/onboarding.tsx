import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { STORAGE_KEYS } from '@/constants/storage';

const slides = [
  {
    id: '1',
    title: 'Фіксуйте ідеї одразу',
    description: 'Створюйте нотатки за кілька секунд і не губіть важливі думки протягом дня.',
    accent: '#0f766e',
  },
  {
    id: '2',
    title: 'Працюйте свайпом',
    description: 'Гортайте онбординг горизонтально та швидко знайомтеся з можливостями застосунку.',
    accent: '#ea580c',
  },
  {
    id: '3',
    title: 'Тримайте все під рукою',
    description: 'Список нотаток завжди підготовлений до додавання, перегляду й видалення записів.',
    accent: '#2563eb',
  },
  {
    id: '4',
    title: 'Починаймо',
    description: 'Завершіть знайомство та переходьте до свого першого запису просто зараз.',
    accent: '#7c3aed',
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<typeof slides[0]>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.firstLaunch, 'false');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save onboarding completion', error);
      Alert.alert(
        'Не вдалося завершити онбординг',
        'Спробуйте ще раз. Якщо помилка повториться, перезапустіть застосунок.'
      );
    }
  };

  const syncCurrentIndex = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    const safeIndex = Math.max(0, Math.min(slides.length - 1, slideIndex));
    setCurrentIndex(safeIndex);
  };

  const goToSlide = (index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
  };

  const goNext = async () => {
    if (currentIndex === slides.length - 1) {
      await finishOnboarding();
      return;
    }

    goToSlide(currentIndex + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={finishOnboarding} style={styles.skipButton}>
          <Text style={styles.skipLabel}>Пропустити</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScroll={syncCurrentIndex}
        onMomentumScrollEnd={syncCurrentIndex}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.illustration, { backgroundColor: item.accent }]}>
              <Text style={styles.illustrationText}>#{item.id}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((slide, index) => (
            <Pressable
              key={slide.id}
              onPress={() => goToSlide(index)}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : null,
              ]}>
              <Text style={[styles.dotLabel, index === currentIndex ? styles.dotLabelActive : null]}>
                {slide.id}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={goNext} style={styles.primaryButton}>
          <Text style={styles.primaryLabel}>
            {currentIndex === slides.length - 1 ? 'Розпочати' : 'Далі'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  skipLabel: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  illustration: {
    width: 180,
    height: 180,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  illustrationText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '700',
  },
  title: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    color: '#475569',
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 24,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: '#0f766e',
  },
  dotLabel: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  dotLabelActive: {
    color: '#ffffff',
  },
  primaryButton: {
    backgroundColor: '#0f766e',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
