import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const value = await AsyncStorage.getItem('isFirstLaunch');
      setIsFirstLaunch(value === null);
    };
    checkFirstLaunch();
  }, []);

  if (isFirstLaunch === null) return null;

  return isFirstLaunch ? <OnboardingScreen /> : <HomeScreen />;
}