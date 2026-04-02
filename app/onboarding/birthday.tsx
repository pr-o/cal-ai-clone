import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboardingStore';

const DEFAULT_DATE = new Date(1995, 0, 1);

export default function BirthdayScreen() {
  const { birthday, setBirthday } = useOnboardingStore();
  const [date, setDate] = useState<Date>(
    birthday ? new Date(birthday) : DEFAULT_DATE
  );
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  function handleChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDate(selected);
  }

  function handleNext() {
    const iso = date.toISOString().split('T')[0];
    setBirthday(iso);
    router.push('/onboarding/current-weight');
  }

  const formatted = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <OnboardingLayout step={3} total={10}>
      <Text className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mt-6">
        When were you born?
      </Text>
      <Text className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1 mb-8">
        Age affects your calorie needs.
      </Text>

      {Platform.OS === 'android' && (
        <Pressable
          onPress={() => setShowPicker(true)}
          className="border-2 border-border dark:border-dark-border rounded-2xl p-4 mb-4 bg-white dark:bg-dark-secondary"
        >
          <Text className="text-text-primary dark:text-text-dark-primary font-medium">
            {formatted}
          </Text>
        </Pressable>
      )}

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          maximumDate={new Date()}
          minimumDate={new Date(1920, 0, 1)}
          textColor={undefined}
          style={{ flex: Platform.OS === 'ios' ? 1 : undefined }}
        />
      )}

      <View className={Platform.OS === 'ios' ? 'flex-1' : 'mt-4'} />

      <Pressable
        onPress={handleNext}
        className="bg-text-primary dark:bg-text-dark-primary rounded-2xl py-4 items-center mb-6"
      >
        <Text className="text-white dark:text-dark-primary font-bold text-base">
          Next
        </Text>
      </Pressable>
    </OnboardingLayout>
  );
}
