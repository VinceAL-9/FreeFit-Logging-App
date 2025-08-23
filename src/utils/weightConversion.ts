export type WeightUnit = 'kg' | 'lbs';

export const KG_TO_LBS = 2.20462;

export const LBS_TO_KG = 1 / KG_TO_LBS;

export const convertWeight = (
  weight: number,
  from: WeightUnit,
  to: WeightUnit,
): number => {
  if (from === to) return weight;
  return from === 'kg' ? weight * KG_TO_LBS : weight * LBS_TO_KG;
};

export const getQuickIncrements = (unit: WeightUnit) =>
  unit === 'kg' ? [2.5, 5, 10, 20] : [5, 10, 25, 45];

export const getWeightIncrement = (unit: WeightUnit) => (unit === 'kg' ? 2.5 : 5);

// New helper functions for volume calculations with unit conversion
export const calculateSetVolume = (
  reps: number,
  weight: number,
  setUnit: WeightUnit,
  targetUnit: WeightUnit,
): number => {
  const convertedWeight = convertWeight(weight, setUnit, targetUnit);
  return convertedWeight * reps;
};

export const calculateTotalVolumeForSets = (
  sets: Array<{ reps: number; weight: number; unit: WeightUnit }>,
  targetUnit: WeightUnit,
): number => {
  return sets.reduce((total, set) => {
    return total + calculateSetVolume(set.reps, set.weight, set.unit, targetUnit);
  }, 0);
};

// Format large numbers with abbreviations to prevent UI cramping
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toFixed(0);
  }
};