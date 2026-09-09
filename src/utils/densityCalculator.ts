/**
 * NMFTA Density-based Freight Classification Standard Calculator
 * Computes cubic volume, pounds per cubic foot (PCF), and standard NMFC freight class.
 */

export interface DensityClassRule {
  minDensity: number;
  maxDensity: number;
  nmfcClass: string;
  description: string;
}

export const NMFC_DENSITY_TABLE: DensityClassRule[] = [
  { minDensity: 50, maxDensity: Infinity, nmfcClass: '50', description: 'Clean freight, metals, dense heavy machinery' },
  { minDensity: 35, maxDensity: 50, nmfcClass: '55', description: 'Bricks, heavy hardware, bolts, engine blocks' },
  { minDensity: 30, maxDensity: 35, nmfcClass: '60', description: 'Car parts, boxed glass, ceramics, iron' },
  { minDensity: 22.5, maxDensity: 30, nmfcClass: '65', description: 'Packaged machinery, tiles, bottled goods' },
  { minDensity: 15, maxDensity: 22.5, nmfcClass: '70', description: 'Automobile accessories, food items, cables' },
  { minDensity: 13.5, maxDensity: 15, nmfcClass: '77.5', description: 'Tires, industrial pumps, large tools' },
  { minDensity: 12, maxDensity: 13.5, nmfcClass: '85', description: 'Cast stone, small engines, transmissions' },
  { minDensity: 10.5, maxDensity: 12, nmfcClass: '92.5', description: 'Computers, electrical equipment, monitors' },
  { minDensity: 9, maxDensity: 10.5, nmfcClass: '100', description: 'Canvas goods, vacuum cleaners, wines' },
  { minDensity: 8, maxDensity: 9, nmfcClass: '110', description: 'Cabinets, framed artwork, wrapped furniture' },
  { minDensity: 7, maxDensity: 8, nmfcClass: '125', description: 'Small appliances, lampshades, exhaust pipes' },
  { minDensity: 6, maxDensity: 7, nmfcClass: '150', description: 'Chairs, steel sheet metal, athletic equipment' },
  { minDensity: 5, maxDensity: 6, nmfcClass: '175', description: 'Couches, stuffed items, padded panels' },
  { minDensity: 4, maxDensity: 5, nmfcClass: '200', description: 'Televisions, aircraft parts, aluminum frames' },
  { minDensity: 3, maxDensity: 4, nmfcClass: '250', description: 'Bamboo furniture, light fixtures, mattresses' },
  { minDensity: 2, maxDensity: 3, nmfcClass: '300', description: 'Wood cabinets, model airplanes, light signs' },
  { minDensity: 1, maxDensity: 2, nmfcClass: '400', description: 'Lighting fixtures, deer horns, polystyrene' },
  { minDensity: 0, maxDensity: 1, nmfcClass: '500', description: 'Ping pong balls, gold leaf, ultra-low density cargo' },
];

/**
 * Calculates density in pounds per cubic foot (PCF)
 */
export function calculateDensityPcf(
  length: number,
  width: number,
  height: number,
  weight: number,
  dimUnit: 'in' | 'cm' = 'in',
  weightUnit: 'lbs' | 'kg' = 'lbs',
  units: number = 1
): number | null {
  if (!length || !width || !height || !weight || length <= 0 || width <= 0 || height <= 0 || weight <= 0) {
    return null;
  }

  // Convert dimensions to inches
  const lIn = dimUnit === 'cm' ? length / 2.54 : length;
  const wIn = dimUnit === 'cm' ? width / 2.54 : width;
  const hIn = dimUnit === 'cm' ? height / 2.54 : height;

  // Cubic inches to cubic feet (1728 cu inches = 1 cu ft)
  const cuInches = lIn * wIn * hIn;
  const singleCuFeet = cuInches / 1728;
  const totalCuFeet = singleCuFeet * Math.max(1, Number(units) || 1);

  // Weight to lbs (Weight is TOTAL line item weight, not per unit)
  const weightLbs = weightUnit === 'kg' ? weight * 2.20462 : weight;

  if (totalCuFeet <= 0) return null;

  const density = weightLbs / totalCuFeet;
  return Math.round(density * 10) / 10;
}

/**
 * Determines NMFC Class from calculated density PCF
 */
export function getNMFCClassFromDensity(densityPcf: number | null): string {
  if (densityPcf === null || isNaN(densityPcf) || densityPcf <= 0) {
    return '70'; // standard default
  }

  for (const rule of NMFC_DENSITY_TABLE) {
    if (densityPcf >= rule.minDensity && densityPcf < rule.maxDensity) {
      return rule.nmfcClass;
    }
  }

  if (densityPcf >= 50) return '50';
  return '500';
}
