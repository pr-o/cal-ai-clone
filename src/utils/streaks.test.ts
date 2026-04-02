import { calculateStreak } from './streaks';

jest.mock('./streaks', () => {
  const actual = jest.requireActual('./streaks');
  return {
    ...actual,
    // Override getTodayString used inside calculateStreak via module internals
  };
});

// We'll test by passing dates that include/exclude today
describe('calculateStreak', () => {
  it('returns 0 for empty array', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('returns 0 when today is not in the array', () => {
    expect(calculateStreak(['2020-01-01', '2020-01-02'])).toBe(0);
  });

  it('returns 1 when only today is logged', () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    expect(calculateStreak([todayStr])).toBe(1);
  });

  it('returns correct streak for consecutive days ending today', () => {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    expect(calculateStreak(dates)).toBe(5);
  });

  it('breaks streak on missing day', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    // Skip day before yesterday
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    const dates = [
      today.toISOString().split('T')[0],
      yesterday.toISOString().split('T')[0],
      threeDaysAgo.toISOString().split('T')[0],
    ];
    expect(calculateStreak(dates)).toBe(2);
  });
});
