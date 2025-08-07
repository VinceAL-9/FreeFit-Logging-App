export type WeightUnit = 'kg' | 'lbs';
export const KG_TO_LBS = 2.20462;

export const convertWeight = (
  weight: number,
  from: WeightUnit,
  to: WeightUnit,
): number => {
  if (from === to) return weight;
  return from === 'kg' ? weight * KG_TO_LBS : weight / KG_TO_LBS;
};

export const getQuickIncrements = (unit: WeightUnit) =>
  unit === 'kg' ? [2.5, 5, 10, 20] : [5, 10, 25, 45];

export const getWeightIncrement = (unit: WeightUnit) => (unit === 'kg' ? 2.5 : 5);
