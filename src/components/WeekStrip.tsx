import { Pressable, ScrollView, Text } from 'react-native';

interface WeekStripProps {
  selectedDate: string; // YYYY-MM-DD
  onDaySelect: (date: string) => void;
}

function getWeekDates(): { date: string; day: string; num: number }[] {
  const today = new Date();
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    result.push({
      date: `${y}-${m}-${day}`,
      day: days[d.getDay()],
      num: d.getDate(),
    });
  }

  return result;
}

export function WeekStrip({ selectedDate, onDaySelect }: WeekStripProps) {
  const weekDates = getWeekDates();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 4 }}
      className="flex-row"
    >
      {weekDates.map(({ date, day, num }) => {
        const isSelected = date === selectedDate;
        return (
          <Pressable
            key={date}
            onPress={() => onDaySelect(date)}
            className={`items-center mx-1.5 w-9 py-2 rounded-2xl ${
              isSelected
                ? 'bg-text-primary dark:bg-text-dark-primary'
                : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isSelected
                  ? 'text-white dark:text-dark-primary'
                  : 'text-text-secondary dark:text-text-dark-secondary'
              }`}
            >
              {day}
            </Text>
            <Text
              className={`text-sm font-bold mt-0.5 ${
                isSelected
                  ? 'text-white dark:text-dark-primary'
                  : 'text-text-primary dark:text-text-dark-primary'
              }`}
            >
              {num}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
