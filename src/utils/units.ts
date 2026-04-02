// Weight
export const kgToLbs = (kg: number): number => Math.round(kg * 2.20462 * 10) / 10;
export const lbsToKg = (lbs: number): number => Math.round((lbs / 2.20462) * 10) / 10;

// Height
export interface FtIn {
  ft: number;
  in: number;
}

export const cmToFtIn = (cm: number): FtIn => {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { ft, in: inches };
};

export const ftInToCm = (ft: number, inches: number): number =>
  Math.round((ft * 12 + inches) * 2.54 * 10) / 10;

// Volume (water)
export const mlToOz = (ml: number): number => Math.round(ml * 0.033814 * 10) / 10;
export const ozToMl = (oz: number): number => Math.round(oz * 29.5735);

// Display helpers
export const formatWeight = (kg: number, unit: 'kg' | 'lbs'): string =>
  unit === 'lbs' ? `${kgToLbs(kg)} lbs` : `${kg} kg`;

export const formatHeight = (cm: number, unit: 'kg' | 'lbs'): string => {
  if (unit === 'lbs') {
    const { ft, in: inches } = cmToFtIn(cm);
    return `${ft}'${inches}"`;
  }
  return `${cm} cm`;
};
