import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  searchFoods,
  NutritionixFood,
  NutritionixError,
} from '@/services/nutritionix';
import { useDailyStore } from '@/stores/dailyStore';
import { BottomSheetModal } from '@/components/BottomSheetModal';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NutritionixFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noKeyError, setNoKeyError] = useState(false);
  const [selected, setSelected] = useState<NutritionixFood | null>(null);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addFoodEntry = useDailyStore((s) => s.addFoodEntry);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function doSearch(q: string) {
    setLoading(true);
    setError(null);
    setNoKeyError(false);
    try {
      const foods = await searchFoods(q);
      setResults(foods);
    } catch (e) {
      if (
        e instanceof NutritionixError &&
        e.code === 'NO_API_KEY'
      ) {
        setNoKeyError(true);
      } else if (e instanceof Error) {
        setError(e.message);
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(food: NutritionixFood) {
    setSaving(true);
    try {
      await addFoodEntry({
        name: food.name,
        calories: food.calories,
        proteinG: food.proteinG,
        carbsG: food.carbsG,
        fatG: food.fatG,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        mealType: 'snack',
        source: 'search',
        photoUri: null,
      });
      router.replace('/(tabs)/');
    } catch {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-primary" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border dark:border-dark-border">
        <Pressable onPress={() => router.back()} className="mr-3" hitSlop={8}>
          <Text className="text-text-primary dark:text-text-dark-primary text-lg">←</Text>
        </Pressable>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search foods (e.g. banana, chicken rice)"
          placeholderTextColor="#9CA3AF"
          autoFocus
          returnKeyType="search"
          className="flex-1 text-text-primary dark:text-text-dark-primary text-sm"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Text className="text-text-secondary dark:text-text-dark-secondary text-lg ml-2">✕</Text>
          </Pressable>
        )}
      </View>

      {/* Content */}
      {noKeyError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">🔑</Text>
          <Text className="text-base font-bold text-text-primary dark:text-text-dark-primary mb-2 text-center">
            API keys required
          </Text>
          <Text className="text-sm text-text-secondary dark:text-text-dark-secondary text-center mb-5">
            Add your Nutritionix App ID and API key in Settings to use food search.
          </Text>
          <Pressable
            onPress={() => {
              router.back();
              router.push('/(tabs)/settings');
            }}
            className="bg-text-primary dark:bg-text-dark-primary rounded-2xl px-6 py-3"
          >
            <Text className="text-white font-bold">Open Settings</Text>
          </Pressable>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-red-400 text-sm text-center">{error}</Text>
        </View>
      ) : !query.trim() ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">🔍</Text>
          <Text className="text-sm text-text-secondary dark:text-text-dark-secondary text-center">
            Type a food name to search the Nutritionix database
          </Text>
        </View>
      ) : loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-sm text-text-secondary dark:text-text-dark-secondary text-center">
            No results for "{query}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelected(item)}
              className="flex-row items-center bg-white dark:bg-dark-secondary rounded-2xl p-3 mb-2 shadow-sm"
            >
              {item.photoUrl ? (
                <Image
                  source={{ uri: item.photoUrl }}
                  className="w-12 h-12 rounded-xl mr-3"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-12 h-12 rounded-xl mr-3 bg-bg-secondary dark:bg-dark-primary items-center justify-center">
                  <Text className="text-2xl">🥗</Text>
                </View>
              )}
              <View className="flex-1">
                <Text
                  className="font-bold text-text-primary dark:text-text-dark-primary text-sm capitalize"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
                  {item.servingSize} {item.servingUnit} · {item.calories} kcal
                </Text>
              </View>
              <Text className="text-xs text-text-secondary dark:text-text-dark-secondary">
                P {item.proteinG}g
              </Text>
            </Pressable>
          )}
        />
      )}

      {/* Confirm modal */}
      <BottomSheetModal visible={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
              <Text className="text-lg font-bold text-text-primary dark:text-text-dark-primary mb-1 capitalize">
                {selected.name}
              </Text>
              <Text className="text-xs text-text-secondary dark:text-text-dark-secondary mb-4">
                {selected.servingSize} {selected.servingUnit}
              </Text>

              <View className="flex-row mb-5 gap-2">
                <View className="flex-1 bg-bg-secondary dark:bg-dark-primary rounded-2xl p-3 items-center">
                  <Text className="text-lg font-black text-text-primary dark:text-text-dark-primary">
                    {selected.calories}
                  </Text>
                  <Text className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    kcal
                  </Text>
                </View>
                <View className="flex-1 bg-bg-secondary dark:bg-dark-primary rounded-2xl p-3 items-center">
                  <Text className="text-base font-bold text-macro-protein">
                    {selected.proteinG}g
                  </Text>
                  <Text className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    Protein
                  </Text>
                </View>
                <View className="flex-1 bg-bg-secondary dark:bg-dark-primary rounded-2xl p-3 items-center">
                  <Text className="text-base font-bold text-macro-carbs">
                    {selected.carbsG}g
                  </Text>
                  <Text className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    Carbs
                  </Text>
                </View>
                <View className="flex-1 bg-bg-secondary dark:bg-dark-primary rounded-2xl p-3 items-center">
                  <Text className="text-base font-bold text-macro-fat">
                    {selected.fatG}g
                  </Text>
                  <Text className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    Fat
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => handleAdd(selected)}
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
          </>
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}
