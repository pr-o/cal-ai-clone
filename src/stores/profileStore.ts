import { create } from 'zustand';
import { eq } from 'drizzle-orm';
import { db } from '@/db/index';
import { profiles, type Profile } from '@/db/schema';

interface ProfileStore {
  profile: Profile | null;
  dailyCalories: number;
  dailyProteinG: number;
  dailyCarbsG: number;
  dailyFatG: number;

  hydrate: () => Promise<void>;
  updateGoals: (goals: {
    dailyCalories: number;
    dailyProteinG: number;
    dailyCarbsG: number;
    dailyFatG: number;
  }) => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  dailyCalories: 2000,
  dailyProteinG: 150,
  dailyCarbsG: 200,
  dailyFatG: 65,

  hydrate: async () => {
    const rows = await db.select().from(profiles).limit(1);
    if (rows.length > 0) {
      const p = rows[0];
      set({
        profile: p,
        dailyCalories: p.dailyCalories,
        dailyProteinG: p.dailyProteinG,
        dailyCarbsG: p.dailyCarbsG,
        dailyFatG: p.dailyFatG,
      });
    }
  },

  updateGoals: async (goals) => {
    const { profile } = get();
    if (!profile) return;
    await db
      .update(profiles)
      .set(goals)
      .where(eq(profiles.id, profile.id));
    set({ ...goals, profile: { ...profile, ...goals } });
  },
}));
