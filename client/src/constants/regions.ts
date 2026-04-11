/**
 * Geographic data for product availability (client-side)
 * - Niger: 8 regions with country codes
 * - Benin: Cotonou with shipping delay metadata
 */

export const COUNTRIES = {
  NIGER: 'niger',
  BENIN: 'benin',
} as const;

export type Country = (typeof COUNTRIES)[keyof typeof COUNTRIES];

export const NIGER_REGIONS = [
  { name: 'Agadez', code: 'AZ' },
  { name: 'Diffa', code: 'DA' },
  { name: 'Dosso', code: 'DO' },
  { name: 'Maradi', code: 'MI' },
  { name: 'Tahoua', code: 'TA' },
  { name: 'Tillabéri', code: 'TI' },
  { name: 'Zinder', code: 'ZR' },
  { name: 'Niamey', code: 'NY' },
] as const;

export type NigerRegion = (typeof NIGER_REGIONS)[number];

export const BENIN_LOCATIONS = [
  { name: 'Cotonou', code: 'CT', hasShippingDelay: true },
] as const;

export type BeninLocation = (typeof BENIN_LOCATIONS)[number];

export const getRegionsByCountry = (country: Country) => {
  if (country === COUNTRIES.NIGER) return NIGER_REGIONS;
  if (country === COUNTRIES.BENIN) return BENIN_LOCATIONS;
  return [];
};

export const getCountryLabel = (country: Country): string => {
  const normalized = String(country).toLowerCase();
  if (normalized === COUNTRIES.NIGER) return 'Niger';
  if (normalized === COUNTRIES.BENIN) return 'Benin';
  return '';
};

export const getCountryFlag = (country: Country): string => {
  const normalized = String(country).toLowerCase();
  if (normalized === COUNTRIES.NIGER) return '🇳🇪';
  if (normalized === COUNTRIES.BENIN) return '🇧🇯';
  return '';
};
