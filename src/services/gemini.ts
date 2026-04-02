import { useSettingsStore } from '@/stores/settingsStore';

export interface FoodAnalysis {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSize: number;
  servingUnit: string;
  healthScore: number; // 1–10
  ingredients: string[];
}

export class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiError';
  }
}

const PROMPT = (correctionHint?: string) => `
Analyze this food image and return ONLY a valid JSON object (no markdown, no prose) with exactly these fields:
{
  "name": "string — food name",
  "calories": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "servingSize": number,
  "servingUnit": "string — e.g. g, oz, piece, cup",
  "healthScore": number between 1 and 10,
  "ingredients": ["string", ...]
}
${correctionHint ? `\nUser correction: "${correctionHint}". Adjust your analysis accordingly.` : ''}
All numeric values must be for ONE serving. If you cannot identify food, still return the JSON with your best estimate.
`.trim();

export async function analyzeFood(
  base64Image: string,
  correctionHint?: string
): Promise<FoodAnalysis> {
  const apiKey = useSettingsStore.getState().getGeminiApiKey();
  if (!apiKey) {
    throw new GeminiError('Gemini API key not set. Go to Settings to add it.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          { text: PROMPT(correctionHint) },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 512,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new GeminiError(`Gemini API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const rawText: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Strip markdown code fences if present
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  let parsed: FoodAnalysis;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new GeminiError(
      `Could not parse Gemini response as JSON. Raw: ${rawText.slice(0, 200)}`
    );
  }

  // Validate required fields
  const required: (keyof FoodAnalysis)[] = [
    'name',
    'calories',
    'proteinG',
    'carbsG',
    'fatG',
    'servingSize',
    'healthScore',
  ];
  for (const field of required) {
    if (parsed[field] === undefined || parsed[field] === null) {
      throw new GeminiError(`Missing field in Gemini response: ${field}`);
    }
  }

  return {
    name: String(parsed.name),
    calories: Math.round(Number(parsed.calories)),
    proteinG: Math.round(Number(parsed.proteinG) * 10) / 10,
    carbsG: Math.round(Number(parsed.carbsG) * 10) / 10,
    fatG: Math.round(Number(parsed.fatG) * 10) / 10,
    servingSize: Number(parsed.servingSize) || 1,
    servingUnit: String(parsed.servingUnit || 'serving'),
    healthScore: Math.min(10, Math.max(1, Math.round(Number(parsed.healthScore)))),
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
  };
}
