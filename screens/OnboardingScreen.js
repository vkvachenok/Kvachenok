import React, { useState } from 'react';
import { View, Text, FlatList, Dimensions, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const slides = [
  { id: '1', text: 'Welcome to Notes App' },
  { id: '2', text: 'Create your notes' },
  { id: '3', text: 'Save your ideas' },
  { id: '4', text: 'Let’s start!' },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('isFirstLaunch', 'false');
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>{item.text}</Text>
          </View>
        )}
      />

      <Text style={{ textAlign: 'center', marginTop: 10 }}>
        {currentIndex + 1} / 4
      </Text>

      <Button title="Пропустити" onPress={finishOnboarding} />
    </View>
  );
}