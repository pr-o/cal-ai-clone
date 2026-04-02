import { Image, Pressable, Text, View } from 'react-native';

interface FoodEntryCardProps {
  id: number;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  photoUri?: string | null;
  loggedAt: string;
  onDelete?: (id: number) => void;
}

export function FoodEntryCard({
  id,
  name,
  calories,
  proteinG,
  carbsG,
  fatG,
  photoUri,
  loggedAt,
  onDelete,
}: FoodEntryCardProps) {
  const time = new Date(loggedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View className="flex-row items-center bg-white dark:bg-dark-secondary rounded-2xl p-3 mb-2 shadow-sm">
      {/* Photo thumbnail or placeholder */}
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          className="w-12 h-12 rounded-xl mr-3"
          resizeMode="cover"
        />
      ) : (
        <View className="w-12 h-12 rounded-xl mr-3 bg-bg-secondary dark:bg-dark-primary items-center justify-center">
          <Text className="text-2xl">🍽️</Text>
        </View>
      )}

      {/* Info */}
      <View className="flex-1">
        <Text className="font-bold text-text-primary dark:text-text-dark-primary text-sm" numberOfLines={1}>
          {name}
        </Text>
        <View className="flex-row items-center mt-0.5 gap-2">
          <Text className="text-xs text-text-secondary dark:text-text-dark-secondary">
            🔥 {calories} kcal
          </Text>
          <Text className="text-xs text-macro-protein">P {proteinG}g</Text>
          <Text className="text-xs text-macro-carbs">C {carbsG}g</Text>
          <Text className="text-xs text-macro-fat">F {fatG}g</Text>
        </View>
      </View>

      {/* Time + delete */}
      <View className="items-end">
        <Text className="text-xs text-text-secondary dark:text-text-dark-secondary">{time}</Text>
        {onDelete && (
          <Pressable
            onPress={() => onDelete(id)}
            hitSlop={8}
            className="mt-1"
          >
            <Text className="text-xs text-red-400">✕</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
