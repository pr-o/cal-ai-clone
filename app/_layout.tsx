import '../global.css';
import { useEffect } from 'react';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  Inter_900Black,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { colorScheme as nwColorScheme, useColorScheme } from 'nativewind';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Text, View } from 'react-native';
import migrations from '../drizzle/migrations';
import { db } from '@/db/index';
import { useSettingsStore } from '@/stores/settingsStore';
import { useProfileStore } from '@/stores/profileStore';
import { useDailyStore } from '@/stores/dailyStore';

SplashScreen.preventAutoHideAsync();

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function RootLayout() {
  const theme = useSettingsStore((s) => s.theme);
  const { colorScheme } = useColorScheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_900Black,
  });

  const { success: migrationsSuccess, error: migrationsError } =
    useMigrations(db, migrations);

  const hydrateProfile = useProfileStore((s) => s.hydrate);
  const hydrateDaily = useDailyStore((s) => s.hydrateForDate);
  const setCaloriesRemaining = useDailyStore((s) => s.setCaloriesRemaining);

  // Apply theme from settings to NativeWind
  useEffect(() => {
    nwColorScheme.set(theme);
  }, [theme]);

  // Hydrate stores once migrations succeed
  useEffect(() => {
    if (migrationsSuccess) {
      hydrateProfile().then(() => {
        const goalCals = useProfileStore.getState().dailyCalories;
        hydrateDaily(todayString(), goalCals);
      });
    }
  }, [migrationsSuccess]);

  useEffect(() => {
    if (fontsLoaded && (migrationsSuccess || migrationsError)) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, migrationsSuccess, migrationsError]);

  if (!fontsLoaded) {
    return null;
  }

  if (migrationsError) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-dark-primary">
        <Text className="text-red-500 text-sm px-8 text-center">
          Database migration failed. Please reinstall the app.
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
