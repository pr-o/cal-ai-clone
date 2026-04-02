import { calculateTDEE } from './tdee';

const base = {
  gender: 'male' as const,
  birthday: '1990-01-01',
  currentWeightKg: 80,
  heightCm: 175,
  activityLevel: 'moderate' as const,
  goal: 'maintain' as const,
};

describe('calculateTDEE', () => {
  it('returns positive calories', () => {
    const result = calculateTDEE(base);
    expect(result.calories).toBeGreaterThan(0);
  });

  it('lose goal produces fewer calories than maintain', () => {
    const maintain = calculateTDEE({ ...base, goal: 'maintain' });
    const lose = calculateTDEE({ ...base, goal: 'lose' });
    expect(lose.calories).toBeLessThan(maintain.calories);
  });

  it('gain goal produces more calories than maintain', () => {
    const maintain = calculateTDEE({ ...base, goal: 'maintain' });
    const gain = calculateTDEE({ ...base, goal: 'gain' });
    expect(gain.calories).toBeGreaterThan(maintain.calories);
  });

  it('macros are always positive', () => {
    const result = calculateTDEE(base);
    expect(result.proteinG).toBeGreaterThan(0);
    expect(result.carbsG).toBeGreaterThanOrEqual(0);
    expect(result.fatG).toBeGreaterThan(0);
  });

  it('female produces different calories than male (same inputs)', () => {
    const male = calculateTDEE({ ...base, gender: 'male' });
    const female = calculateTDEE({ ...base, gender: 'female' });
    expect(male.calories).not.toBe(female.calories);
  });

  it('never goes below 1200 calories', () => {
    const extreme = calculateTDEE({
      ...base,
      currentWeightKg: 40,
      heightCm: 140,
      goal: 'lose',
      activityLevel: 'sedentary',
    });
    expect(extreme.calories).toBeGreaterThanOrEqual(1200);
  });
});
