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

SplashScreen.preventAutoHideAsync();

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

  // Apply theme from settings to NativeWind
  useEffect(() => {
    nwColorScheme.set(theme);
  }, [theme]);

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
