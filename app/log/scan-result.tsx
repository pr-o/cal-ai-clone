import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { analyzeFood, FoodAnalysis, GeminiError } from '@/services/gemini';
import { useDailyStore } from '@/stores/dailyStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PHOTO_HEIGHT = SCREEN_HEIGHT * 0.42;

export default function ScanResultScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const addFoodEntry = useDailyStore((s) => s.addFoodEntry);

  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState(1);
  const [name, setName] = useState('');
  const [showIngredients, setShowIngredients] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (photoUri) {
      runAnalysis(photoUri);
    }
  }, [photoUri]);

  async function runAnalysis(uri: string, correctionHint?: string) {
    setLoading(true);
    setError(null);
    try {
      // Read as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const result = await analyzeFood(base64, correctionHint);
      setAnalysis(result);
      setName(result.name);
      setServings(1);
    } catch (e) {
      if (e instanceof GeminiError) {
        setError(e.message);
      } else {
        setError('Unexpected error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleFixResults() {
    Alert.prompt(
      'Fix Results',
      'Describe what the AI got wrong (e.g. "This is a burger, not a salad")',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Re-analyze',
          onPress: (hint?: string) => {
            if (hint && photoUri) runAnalysis(photoUri, hint);
          },
        },
      ],
      'plain-text'
    );
  }

  async function handleDone() {
    if (!analysis) return;
    setSaving(true);
    try {
      const multiplier = servings;
      await addFoodEntry({
        name,
        calories: Math.round(analysis.calories * multiplier),
        proteinG: Math.round(analysis.proteinG * multiplier * 10) / 10,
        carbsG: Math.round(analysis.carbsG * multiplier * 10) / 10,
        fatG: Math.round(analysis.fatG * multiplier * 10) / 10,
        servingSize: analysis.servingSize,
        servingUnit: analysis.servingUnit,
        mealType: 'snack',
        source: 'ai_scan',
        photoUri: photoUri ?? null,
      });
      router.replace('/(tabs)/');
    } catch {
      setSaving(false);
    }
  }

  const scaledCalories = analysis
    ? Math.round(analysis.calories * servings)
    : 0;
  const scaledProtein = analysis
    ? Math.round(analysis.proteinG * servings * 10) / 10
    : 0;
  const scaledCarbs = analysis
    ? Math.round(analysis.carbsG * servings * 10) / 10
    : 0;
  const scaledFat = analysis
    ? Math.round(analysis.fatG * servings * 10) / 10
    : 0;

  return (
    <View className="flex-1 bg-white dark:bg-dark-primary">
      {/* Photo header */}
      <View style={{ height: PHOTO_HEIGHT }}>
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{ height: PHOTO_HEIGHT }}
            className="bg-gray-200 dark:bg-dark-secondary"
          />
        )}
        {/* Gradient overlay for header */}
        <View
          className="absolute top-0 left-0 right-0"
          style={{ height: 100, backgroundColor: 'rgba(0,0,0,0.35)' }}
        />
        <SafeAreaView
          edges={['top']}
          className="absolute top-0 left-0 right-0"
        >
          <View className="flex-row items-center justify-between px-4 pt-1">
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-black/40 items-center justify-center"
            >
              <Text className="text-white text-lg">←</Text>
            </Pressable>
            <Text className="text-white font-bold text-base">Nutrition</Text>
            <View className="w-9" />
          </View>
        </SafeAreaView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="text-text-secondary dark:text-text-dark-secondary text-sm mt-3">
            Analyzing your food...
          </Text>
        </View>
      ) : error ? (
        <ScrollView className="flex-1 p-5">
          <Text className="text-red-500 text-sm mb-4">{error}</Text>
          <Pressable
            onPress={() => photoUri && runAnalysis(photoUri)}
            className="bg-text-primary dark:bg-text-dark-primary rounded-2xl py-3 items-center mb-3"
          >
            <Text className="text-white font-bold">Try Again</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} className="items-center">
            <Text className="text-text-secondary text-sm">Go back</Text>
          </Pressable>
        </ScrollView>
      ) : analysis ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {/* Food name */}
          <TextInput
            value={name}
            onChangeText={setName}
            className="text-xl font-bold text-text-primary dark:text-text-dark-primary mb-3 border-b border-transparent"
            style={{ borderBottomColor: '#E5E5E5', borderBottomWidth: 1 }}
          />

          {/* Servings */}
          <View className="flex-row items-center mb-4">
            <Text className="text-sm text-text-secondary dark:text-text-dark-secondary flex-1">
              Servings
            </Text>
            <Pressable
              onPress={() => setServings((s) => Math.max(0.5, s - 0.5))}
              className="w-8 h-8 rounded-full bg-bg-secondary dark:bg-dark-secondary items-center justify-center"
            >
              <Text className="text-text-primary dark:text-text-dark-primary font-bold">−</Text>
            </Pressable>
            <Text className="text-base font-bold text-text-primary dark:text-text-dark-primary mx-4 w-8 text-center">
              {servings}
            </Text>
            <Pressable
              onPress={() => setServings((s) => s + 0.5)}
              className="w-8 h-8 rounded-full bg-bg-secondary dark:bg-dark-secondary items-center justify-center"
            >
              <Text className="text-text-primary dark:text-text-dark-primary font-bold">+</Text>
            </Pressable>
          </View>

          {/* Calories */}
          <View className="flex-row items-center mb-4 bg-bg-secondary dark:bg-dark-secondary rounded-2xl p-4">
            <Text className="text-2xl mr-2">🔥</Text>
            <Text className="text-3xl font-black text-text-primary dark:text-text-dark-primary">
              {scaledCalories}
            </Text>
            <Text className="text-sm text-text-secondary dark:text-text-dark-secondary ml-1 self-end mb-1">
              kcal
            </Text>
          </View>

          {/* Macros row */}
          <View className="flex-row mb-4 gap-2">
            <View className="flex-1 bg-bg-secondary dark:bg-dark-secondary rounded-2xl p-3 items-center">
              <Text className="text-base font-bold text-macro-protein">
                {scaledProtein}g
              </Text>
              <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
                Protein
              </Text>
            </View>
            <View className="flex-1 bg-bg-secondary dark:bg-dark-secondary rounded-2xl p-3 items-center">
              <Text className="text-base font-bold text-macro-carbs">
                {scaledCarbs}g
              </Text>
              <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
                Carbs
              </Text>
            </View>
            <View className="flex-1 bg-bg-secondary dark:bg-dark-secondary rounded-2xl p-3 items-center">
              <Text className="text-base font-bold text-macro-fat">
                {scaledFat}g
              </Text>
              <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
                Fat
              </Text>
            </View>
          </View>

          {/* Health score */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                Health Score
              </Text>
              <Text className="text-sm font-bold text-green-500">
                {analysis.healthScore}/10
              </Text>
            </View>
            <View className="h-2 bg-gray-200 dark:bg-dark-secondary rounded-full overflow-hidden">
              <View
                className="h-2 bg-green-500 rounded-full"
                style={{ width: `${(analysis.healthScore / 10) * 100}%` }}
              />
            </View>
          </View>

          {/* Ingredients (collapsible) */}
          {analysis.ingredients.length > 0 && (
            <Pressable
              onPress={() => setShowIngredients((v) => !v)}
              className="flex-row items-center justify-between mb-2"
            >
              <Text className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                Ingredients
              </Text>
              <Text className="text-xs text-text-secondary dark:text-text-dark-secondary">
                {showIngredients ? '▲ Hide' : '▼ Show'}
              </Text>
            </Pressable>
          )}
          {showIngredients && (
            <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mb-4 leading-5">
              {analysis.ingredients.join(', ')}
            </Text>
          )}

          {/* Fix Results */}
          <Pressable
            onPress={handleFixResults}
            className="border border-border dark:border-dark-border rounded-2xl py-3 items-center mb-3"
          >
            <Text className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
              Fix Results ✏️
            </Text>
          </Pressable>

          {/* Done */}
          <Pressable
            onPress={handleDone}
            disabled={saving}
            className="bg-text-primary dark:bg-text-dark-primary rounded-2xl py-4 items-center"
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                Add to Log ✓
              </Text>
            )}
          </Pressable>
        </ScrollView>
      ) : null}
    </View>
  );
}
