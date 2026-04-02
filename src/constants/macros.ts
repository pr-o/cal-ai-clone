export type MacroType = 'protein' | 'carbs' | 'fat';

export const MACRO_CONFIG: Record<
  MacroType,
  { label: string; icon: string; color: string }
> = {
  protein: { label: 'Protein left', icon: '🥩', color: '#FF6B35' },
  carbs: { label: 'Carbs left', icon: '🌾', color: '#FFB800' },
  fat: { label: 'Fat left', icon: '🫙', color: '#4A9EFF' },
};

export const MACRO_COLORS = {
  protein: '#FF6B35',
  carbs: '#FFB800',
  fat: '#4A9EFF',
} as const;
