import { useSettingsStore } from '@/stores/settingsStore';

export interface NutritionixFood {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSize: number;
  servingUnit: string;
  photoUrl: string | null;
}

export class NutritionixError extends Error {
  constructor(
    message: string,
    public readonly code?: 'NO_API_KEY' | 'API_ERROR' | 'PARSE_ERROR'
  ) {
    super(message);
    this.name = 'NutritionixError';
  }
}

export async function searchFoods(
  query: string
): Promise<NutritionixFood[]> {
  const state = useSettingsStore.getState();
  const appId = state.getNutritionixAppId();
  const apiKey = state.getNutritionixApiKey();

  if (!appId || !apiKey) {
    throw new NutritionixError(
      'Nutritionix API keys not set. Go to Settings to add them.',
      'NO_API_KEY'
    );
  }

  const response = await fetch(
    'https://trackapi.nutritionix.com/v2/natural/nutrients',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': appId,
        'x-app-key': apiKey,
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new NutritionixError(
      `Nutritionix API error ${response.status}: ${text}`,
      'API_ERROR'
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new NutritionixError('Failed to parse Nutritionix response', 'PARSE_ERROR');
  }

  const foods: any[] = data?.foods ?? [];
  return foods.map((f) => ({
    name: String(f.food_name ?? 'Unknown'),
    calories: Math.round(Number(f.nf_calories ?? 0)),
    proteinG: Math.round(Number(f.nf_protein ?? 0) * 10) / 10,
    carbsG: Math.round(Number(f.nf_total_carbohydrate ?? 0) * 10) / 10,
    fatG: Math.round(Number(f.nf_total_fat ?? 0) * 10) / 10,
    servingSize: Number(f.serving_qty ?? 1),
    servingUnit: String(f.serving_unit ?? 'serving'),
    photoUrl: f.photo?.thumb ?? null,
  }));
}
