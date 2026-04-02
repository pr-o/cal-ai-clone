import { useSettingsStore } from '@/stores/settingsStore';

export interface FoodResult {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSize: number;
  servingUnit: string;
  photoUrl: string | null;
}

export class FoodSearchError extends Error {
  constructor(
    message: string,
    public readonly code?: 'NO_API_KEY' | 'API_ERROR' | 'PARSE_ERROR'
  ) {
    super(message);
    this.name = 'FoodSearchError';
  }
}

function getNutrient(nutrients: any[], name: string): number {
  const match = nutrients.find(
    (n: any) => typeof n.nutrientName === 'string' && n.nutrientName.toLowerCase().includes(name.toLowerCase())
  );
  return match ? Math.round(Number(match.value) * 10) / 10 : 0;
}

export async function searchFoods(query: string): Promise<FoodResult[]> {
  const apiKey = useSettingsStore.getState().getUsdaApiKey();

  if (!apiKey) {
    throw new FoodSearchError(
      'USDA API key not set. Go to Settings to add it.',
      'NO_API_KEY'
    );
  }

  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&pageSize=20&dataType=Survey%20%28FNDDS%29,SR%20Legacy,Foundation`;

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new FoodSearchError(
      `USDA API error ${response.status}: ${text}`,
      'API_ERROR'
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new FoodSearchError('Failed to parse USDA response', 'PARSE_ERROR');
  }

  const foods: any[] = data?.foods ?? [];
  return foods.map((f) => {
    const nutrients: any[] = f.foodNutrients ?? [];
    const calories = Math.round(getNutrient(nutrients, 'energy'));
    const proteinG = getNutrient(nutrients, 'protein');
    const carbsG = getNutrient(nutrients, 'carbohydrate');
    const fatG = getNutrient(nutrients, 'total lipid');
    const servingSize = f.servingSize ? Number(f.servingSize) : 100;
    const servingUnit = f.servingSizeUnit ?? 'g';

    return {
      name: String(f.description ?? 'Unknown'),
      calories,
      proteinG,
      carbsG,
      fatG,
      servingSize,
      servingUnit,
      photoUrl: null,
    };
  });
}
